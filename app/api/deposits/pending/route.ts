import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const skip = (page - 1) * pageSize

    const [deposits, totalItems] = await Promise.all([
      prisma.deposit.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
              accountNumber: true,
            },
          },
          slipImage: {
            select: {
              id: true,
              imageUrl: true,
              nameFile: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' }, // เก่าสุดก่อน
        skip,
        take: pageSize,
      }),
      prisma.deposit.count({
        where: {
          status: 'PENDING',
        },
      }),
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
    console.error('Error fetching pending deposits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

