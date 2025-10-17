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

    const where = session.user.role === 'ADMIN' 
      ? {}
      : { userId: session.user.id }

    const [purchases, totalItems] = await Promise.all([
      prisma.purchase.findMany({
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
          ownedItem: {
            include: {
              item: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.purchase.count({ where }),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      purchases,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('Error fetching purchases:', error)
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
    const { itemId } = body

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    // ดึงข้อมูล item
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // ตรวจสอบ wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    if (wallet.balance < item.price) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // สร้าง OwnedItem และ Purchase พร้อมหักเงิน
    const result = await prisma.$transaction(async (tx) => {
      // หักเงินจาก wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: item.price,
          },
        },
      })

      // สร้าง OwnedItem
      const ownedItem = await tx.ownedItem.create({
        data: {
          userId: session.user.id,
          itemId: item.id,
          isGifted: false,
        },
      })

      // สร้าง Purchase
      const purchase = await tx.purchase.create({
        data: {
          userId: session.user.id,
          ownedItemId: ownedItem.id,
        },
        include: {
          ownedItem: {
            include: {
              item: true,
            },
          },
        },
      })

      // สร้าง Transaction
      await tx.transaction.create({
        data: {
          amount: item.price,
          type: 'PURCHASE',
          status: 'COMPLETED',
          userId: session.user.id,
          walletId: wallet.id,
          purchaseId: purchase.id,
        },
      })

      return purchase
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

