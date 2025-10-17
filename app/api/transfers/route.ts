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
    if (session.user.role === 'ADMIN') {
      where = {}
    } else if (type === 'sent') {
      where = { senderId: session.user.id }
    } else if (type === 'received') {
      where = { receiverId: session.user.id }
    } else {
      where = {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      }
    }

    const [transfers, totalItems] = await Promise.all([
      prisma.transfer.findMany({
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
          receiver: {
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
      prisma.transfer.count({ where }),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)

    return NextResponse.json({
      transfers,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
      },
    })
  } catch (error) {
    console.error('Error fetching transfers:', error)
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
    const { receiverId, amount, comment } = body

    if (!receiverId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // ตรวจสอบ receiver
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    })

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    if (receiver.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })
    }

    // ตรวจสอบ wallet
    const [senderWallet, receiverWallet] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId: session.user.id } }),
      prisma.wallet.findUnique({ where: { userId: receiverId } }),
    ])

    if (!senderWallet) {
      return NextResponse.json({ error: 'Sender wallet not found' }, { status: 404 })
    }

    if (!receiverWallet) {
      return NextResponse.json({ error: 'Receiver wallet not found' }, { status: 404 })
    }

    if (senderWallet.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // สร้าง Transfer และโอนเงิน
    const result = await prisma.$transaction(async (tx) => {
      // หักเงินจาก sender
      await tx.wallet.update({
        where: { id: senderWallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      })

      // เพิ่มเงินให้ receiver
      await tx.wallet.update({
        where: { id: receiverWallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      })

      // สร้าง Transfer
      const transfer = await tx.transfer.create({
        data: {
          senderId: session.user.id,
          receiverId,
          amount,
          comment,
          status: 'COMPLETED',
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
          receiver: {
            select: {
              id: true,
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
      })

      // สร้าง Transaction สำหรับ sender
      await tx.transaction.create({
        data: {
          amount,
          type: 'TRANSFER',
          status: 'COMPLETED',
          userId: session.user.id,
          walletId: senderWallet.id,
          transferId: transfer.id,
        },
      })

      // สร้าง Transaction สำหรับ receiver
      await tx.transaction.create({
        data: {
          amount,
          type: 'TRANSFER',
          status: 'COMPLETED',
          userId: receiverId,
          walletId: receiverWallet.id,
          transferId: transfer.id,
        },
      })

      return transfer
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating transfer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

