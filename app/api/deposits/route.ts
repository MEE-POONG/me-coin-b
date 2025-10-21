import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const skip = (page - 1) * pageSize

    const where = { userId: session.user.id }

    const [deposits, totalItems] = await Promise.all([
      prisma.deposit.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.deposit.count({ where }),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      deposits,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('Error fetching deposits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, slipImage, rate } = body

    if (!amount || !slipImage || amount <= 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // สร้าง deposit
    const deposit = await prisma.deposit.create({
      data: {
        amount,
        slipImage,
        rate: rate || 1.0,
        userId: session.user.id,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(deposit, { status: 201 })
  } catch (error) {
    console.error('Error creating deposit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

