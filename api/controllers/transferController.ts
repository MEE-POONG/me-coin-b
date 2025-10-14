import { Request, Response } from 'express'
import { prisma } from '../../src/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/transfers - ดึงรายการโอนเงิน
export const getTransfers = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      status = '',
      userId = '',
      id = '',
    } = req.query

    if (id) {
      const transfer = await prisma.transfer.findUnique({
        where: { id: id as string },
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
          transactions: true,
        },
      })

      if (!transfer) {
        return res.status(404).json({
          success: false,
          error: 'ไม่พบรายการโอนเงินที่ต้องการ',
        })
      }

      return res.status(200).json({
        success: true,
        data: transfer,
        message: 'ดึงข้อมูลรายการโอนเงินสำเร็จ',
      })
    }

    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    const whereClause: Prisma.TransferWhereInput = {
      ...(status ? { status: status as any } : {}),
      ...(userId
        ? {
          OR: [
            { senderId: userId as string },
            { receiverId: userId as string },
          ],
        }
        : {}),
    }

    const [transfers, totalTransfers] = await Promise.all([
      prisma.transfer.findMany({
        where: whereClause,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transfer.count({ where: whereClause }),
    ])

    return res.status(200).json({
      success: true,
      data: transfers,
      pagination: {
        totalItems: totalTransfers,
        totalPages: Math.ceil(totalTransfers / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูลรายการโอนเงินสำเร็จ',
    })
  } catch (error) {
    console.error('Get transfers error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการโอนเงิน',
    })
  }
}

// POST /api/transfers - สร้างคำขอโอนเงิน
export const createTransfer = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, amount, comment } = req.body

    if (!senderId || !receiverId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      })
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        error: 'ไม่สามารถโอนเงินให้ตัวเองได้',
      })
    }

    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { id: senderId },
        include: { wallet: true },
      }),
      prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true, username: true },
      }),
    ])

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบผู้ใช้ที่ระบุ',
      })
    }

    if (!sender.wallet) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบ Wallet ของผู้ส่ง',
      })
    }

    const transferAmount = parseFloat(amount)

    if (sender.wallet.balance < transferAmount) {
      return res.status(400).json({
        success: false,
        error: 'ยอดเงินในกระเป๋าไม่เพียงพอ',
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.create({
        data: {
          senderId,
          receiverId,
          amount: transferAmount,
          comment,
          status: 'COMPLETED',
        },
      })

      const senderWallet = await tx.wallet.update({
        where: { userId: senderId },
        data: {
          balance: { decrement: transferAmount },
        },
      })

      const receiverWallet = await tx.wallet.upsert({
        where: { userId: receiverId },
        create: {
          userId: receiverId,
          balance: transferAmount,
        },
        update: {
          balance: { increment: transferAmount },
        },
      })

      const transaction = await tx.transaction.create({
        data: {
          userId: senderId,
          walletId: senderWallet.id,
          transferId: transfer.id,
          amount: transferAmount,
          type: 'TRANSFER',
          status: 'COMPLETED',
        },
      })

      return { transfer, senderWallet, receiverWallet, transaction }
    })

    return res.status(201).json({
      success: true,
      data: result,
      message: 'โอนเงินสำเร็จ',
    })
  } catch (error) {
    console.error('Create transfer error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการโอนเงิน',
    })
  }
}
