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
    const type = searchParams.get('type') // 'sent' or 'received'
    const skip = (page - 1) * pageSize

    let where: any = {}
    if (type === 'sent') {
      where = { senderId: session.user.id }
    } else if (type === 'received') {
      where = { recipientId: session.user.id }
    } else {
      where = {
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id },
        ],
      }
    }

    const [gifts, totalItems] = await Promise.all([
      prisma.gift.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
          recipient: {
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
      prisma.gift.count({ where }),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      gifts,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('Error fetching gifts:', error)
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
    const { recipientId, ownedItemId } = body

    if (!recipientId || !ownedItemId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ตรวจสอบว่าเป็น owned item ของผู้ส่งจริงๆ
    const ownedItem = await prisma.ownedItem.findUnique({
      where: { id: ownedItemId },
      include: { item: true },
    })

    if (!ownedItem || ownedItem.userId !== session.user.id) {
      return NextResponse.json({ error: 'Owned item not found or not yours' }, { status: 404 })
    }

    // ตรวจสอบ recipient
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    })

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    if (recipient.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot gift to yourself' }, { status: 400 })
    }

    // ตรวจสอบ wallet ของ sender และ recipient
    const [senderWallet, recipientWallet] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: session.user.id } }),
      prisma.wallet.findUnique({ where: { userId: recipientId } }),
    ])

    if (!senderWallet || !recipientWallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // สร้าง Gift และโอนความเป็นเจ้าของ
    const result = await prisma.$transaction(async (tx) => {
      // อัปเดต OwnedItem ให้เป็นของ recipient
      await tx.ownedItem.update({
        where: { id: ownedItemId },
        data: {
          userId: recipientId,
          isGifted: true,
        },
      })

      // สร้าง Gift
      const gift = await tx.gift.create({
        data: {
          senderId: session.user.id,
          recipientId,
          ownedItemId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
          recipient: {
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
      })

      // สร้าง Transaction
      await tx.transaction.create({
        data: {
          amount: 0,
          type: 'GIFT',
          status: 'COMPLETED',
          userId: session.user.id,
          walletId: senderWallet.id,
          giftId: gift.id,
        },
      })

      return gift
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating gift:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

