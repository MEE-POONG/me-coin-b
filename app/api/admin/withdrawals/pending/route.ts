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

    const [withdrawals, totalItems] = await Promise.all([
      prisma.withdrawal.findMany({
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
              wallet: {
                select: {
                  balance: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' }, // เก่าสุดก่อน
        skip,
        take: pageSize,
      }),
      prisma.withdrawal.count({
        where: {
          status: 'PENDING',
        },
      }),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      withdrawals,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('Error fetching pending withdrawals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

