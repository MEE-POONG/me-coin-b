import { Request, Response } from 'express'
import { prisma } from '../../src/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/gifts - ดึงรายการของขวัญ
export const getGifts = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      userId = '',
      type = '', // 'sent' or 'received'
      id = '',
    } = req.query

    // ดึง Gift เดียว
    if (id) {
      const gift = await prisma.gift.findUnique({
        where: { id: id as string },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
              email: true,
            },
          },
          recipient: {
            select: {
              id: true,
              username: true,
              avatar: true,
              email: true,
            },
          },
          ownedItem: {
            include: {
              item: true,
            },
          },
          transactions: true,
        },
      })

      if (!gift) {
        return res.status(404).json({
          success: false,
          error: 'ไม่พบของขวัญที่ต้องการ',
        })
      }

      return res.status(200).json({
        success: true,
        data: gift,
        message: 'ดึงข้อมูลของขวัญสำเร็จ',
      })
    }

    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    let whereClause: Prisma.GiftWhereInput = {}

    if (userId) {
      if (type === 'sent') {
        whereClause.senderId = userId as string
      } else if (type === 'received') {
        whereClause.recipientId = userId as string
      } else {
        // ทั้งส่งและรับ
        whereClause.OR = [
          { senderId: userId as string },
          { recipientId: userId as string },
        ]
      }
    }

    const [gifts, totalGifts] = await Promise.all([
      prisma.gift.findMany({
        where: whereClause,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          recipient: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          ownedItem: {
            include: {
              item: true,
            },
          },
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.gift.count({ where: whereClause }),
    ])

    return res.status(200).json({
      success: true,
      data: gifts,
      pagination: {
        totalItems: totalGifts,
        totalPages: Math.ceil(totalGifts / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูลของขวัญสำเร็จ',
    })
  } catch (error) {
    console.error('Get gifts error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลของขวัญ',
    })
  }
}

// POST /api/gifts/send-item - ส่งไอเทมเป็นของขวัญ
export const sendItemGift = async (req: Request, res: Response) => {
  try {
    const { senderId, recipientId, ownedItemId } = req.body

    if (!senderId || !recipientId || !ownedItemId) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      })
    }

    if (senderId === recipientId) {
      return res.status(400).json({
        success: false,
        error: 'ไม่สามารถส่งของขวัญให้ตัวเองได้',
      })
    }

    // ตรวจสอบว่า sender เป็นเจ้าของไอเทมจริง
    const ownedItem = await prisma.ownedItem.findFirst({
      where: {
        id: ownedItemId,
        userId: senderId,
      },
      include: {
        item: true,
      },
    })

    if (!ownedItem) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบไอเทมหรือคุณไม่ใช่เจ้าของ',
      })
    }

    // ตรวจสอบว่า recipient มีอยู่จริง
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, username: true },
    })

    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบผู้รับของขวัญ',
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      // สร้าง Gift record
      const gift = await tx.gift.create({
        data: {
          senderId,
          recipientId,
          ownedItemId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          recipient: {
            select: {
              id: true,
              username: true,
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

      // โอนความเป็นเจ้าของไอเทม
      await tx.ownedItem.update({
        where: { id: ownedItemId },
        data: {
          userId: recipientId,
          isGifted: true,
        },
      })

      // สร้าง Transaction record (optional, ถ้าต้องการติดตาม)
      const senderWallet = await tx.wallet.findUnique({
        where: { userId: senderId },
      })

      if (senderWallet) {
        await tx.transaction.create({
          data: {
            userId: senderId,
            walletId: senderWallet.id,
            giftId: gift.id,
            amount: 0, // ไอเทมไม่มีค่าเงิน
            type: 'GIFT',
            status: 'COMPLETED',
          },
        })
      }

      return gift
    })

    return res.status(201).json({
      success: true,
      data: result,
      message: 'ส่งของขวัญสำเร็จ',
    })
  } catch (error) {
    console.error('Send item gift error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการส่งของขวัญ',
    })
  }
}
