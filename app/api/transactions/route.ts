import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const skip = (page - 1) * pageSize

    const where: any = { userId: session.user.id }

    if (type) where.type = type
    if (status) where.status = status

    const [transactions, totalItems] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: true,
          adminUser: true,
          wallet: true,
          deposit: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)
    console.log(63, `transactions: ${transactions}`);

    return NextResponse.json({
      transactions,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

