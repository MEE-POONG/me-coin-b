import { Request, Response } from 'express'
import { prisma } from '../../src/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/withdrawals - ดึงรายการถอนเงิน
export const getWithdrawals = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      status = '',
      userId = '',
      id = '',
    } = req.query

    if (id) {
      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id: id as string },
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
          transactions: true,
        },
      })

      if (!withdrawal) {
        return res.status(404).json({
          success: false,
          error: 'ไม่พบรายการถอนเงินที่ต้องการ',
        })
      }

      return res.status(200).json({
        success: true,
        data: withdrawal,
        message: 'ดึงข้อมูลรายการถอนเงินสำเร็จ',
      })
    }

    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    const whereClause: Prisma.WithdrawalWhereInput = {
      ...(status ? { status: status as any } : {}),
      ...(userId ? { userId: userId as string } : {}),
    }

    const [withdrawals, totalWithdrawals] = await Promise.all([
      prisma.withdrawal.findMany({
        where: whereClause,
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
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.withdrawal.count({ where: whereClause }),
    ])

    return res.status(200).json({
      success: true,
      data: withdrawals,
      pagination: {
        totalItems: totalWithdrawals,
        totalPages: Math.ceil(totalWithdrawals / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูลรายการถอนเงินสำเร็จ',
    })
  } catch (error) {
    console.error('Get withdrawals error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการถอนเงิน',
    })
  }
}

// POST /api/withdrawals - สร้างคำขอถอนเงิน
export const createWithdrawal = async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      })
    }

    // ตรวจสอบ Wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบ Wallet ของผู้ใช้',
      })
    }

    const withdrawAmount = parseFloat(amount)

    if (wallet.balance < withdrawAmount) {
      return res.status(400).json({
        success: false,
        error: 'ยอดเงินในกระเป๋าไม่เพียงพอ',
      })
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount: withdrawAmount,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return res.status(201).json({
      success: true,
      data: withdrawal,
      message: 'สร้างคำขอถอนเงินสำเร็จ',
    })
  } catch (error) {
    console.error('Create withdrawal error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการสร้างคำขอถอนเงิน',
    })
  }
}

// PUT /api/withdrawals/approve - อนุมัติคำขอถอนเงิน
export const approveWithdrawal = async (req: Request, res: Response) => {
  try {
    const { id, comment } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ ID',
      })
    }

    const existingWithdrawal = await prisma.withdrawal.findUnique({
      where: { id },
      include: { user: { include: { wallet: true } } },
    })

    if (!existingWithdrawal) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบรายการถอนเงินที่ต้องการ',
      })
    }

    if (existingWithdrawal.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'รายการนี้ถูกดำเนินการแล้ว',
      })
    }

    if (!existingWithdrawal.user.wallet) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบ Wallet ของผู้ใช้',
      })
    }

    if (existingWithdrawal.user.wallet.balance < existingWithdrawal.amount) {
      return res.status(400).json({
        success: false,
        error: 'ยอดเงินในกระเป๋าไม่เพียงพอ',
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id },
        data: {
          status: 'APPROVED',
          comment,
        },
      })

      const wallet = await tx.wallet.update({
        where: { userId: existingWithdrawal.userId },
        data: {
          balance: { decrement: existingWithdrawal.amount },
        },
      })

      const transaction = await tx.transaction.create({
        data: {
          userId: existingWithdrawal.userId,
          walletId: wallet.id,
          withdrawalId: id,
          amount: existingWithdrawal.amount,
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
        },
      })

      return { withdrawal: updatedWithdrawal, wallet, transaction }
    })

    return res.status(200).json({
      success: true,
      data: result,
      message: 'อนุมัติคำขอถอนเงินสำเร็จ',
    })
  } catch (error) {
    console.error('Approve withdrawal error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการอนุมัติคำขอถอนเงิน',
    })
  }
}

// PUT /api/withdrawals/reject - ปฏิเสธคำขอถอนเงิน
export const rejectWithdrawal = async (req: Request, res: Response) => {
  try {
    const { id, comment } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ ID',
      })
    }

    const existingWithdrawal = await prisma.withdrawal.findUnique({
      where: { id },
    })

    if (!existingWithdrawal) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบรายการถอนเงินที่ต้องการ',
      })
    }

    if (existingWithdrawal.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'รายการนี้ถูกดำเนินการแล้ว',
      })
    }

    const withdrawal = await prisma.withdrawal.update({
      where: { id },
      data: {
        status: 'REJECTED',
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      data: withdrawal,
      message: 'ปฏิเสธคำขอถอนเงินสำเร็จ',
    })
  } catch (error) {
    console.error('Reject withdrawal error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการปฏิเสธคำขอถอนเงิน',
    })
  }
}
