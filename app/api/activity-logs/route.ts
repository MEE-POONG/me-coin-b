import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const action = searchParams.get('action')
    const model = searchParams.get('model')
    const userId = searchParams.get('userId')
    const skip = (page - 1) * pageSize

    // สร้าง where clause
    const where: any = {}

    // ถ้าเป็น USER ให้ดูได้เฉพาะของตัวเอง
    // ถ้าเป็น ADMIN ดูได้ทั้งหมด หรือ filter ตาม userId
    if (userId) {
      where.userId = userId
    }

    if (action) where.action = action
    if (model) where.model = model

    const [logs, totalItems] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.activityLog.count({ where }),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      logs,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

