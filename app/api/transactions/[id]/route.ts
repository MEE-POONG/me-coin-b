import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
        wallet: {
          select: {
            id: true,
            balance: true,
          },
        },
        deposit: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        withdrawal: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        purchase: {
          include: {
            ownedItem: {
              include: {
                item: true,
              },
            },
          },
        },
        gift: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
            recipient: {
              select: {
                id: true,
                username: true,
              },
            },
            ownedItem: {
              include: {
                item: true,
              },
            },
          },
        },
        transfer: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
            receiver: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // ตรวจสอบสิทธิ์: ต้องเป็น Admin หรือเจ้าของ transaction
    if (session.user.role !== 'ADMIN' && transaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

