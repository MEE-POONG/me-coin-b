import { Request, Response } from 'express'
import { prisma } from '../../src/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/deposits - ดึงรายการ Deposit
export const getDeposits = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      status = '',
      userId = '',
      id = '',
    } = req.query

    // ดึง Deposit เดียว
    if (id) {
      const deposit = await prisma.deposit.findUnique({
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

      if (!deposit) {
        return res.status(404).json({
          success: false,
          error: 'ไม่พบรายการฝากเงินที่ต้องการ',
        })
      }

      return res.status(200).json({
        success: true,
        data: deposit,
        message: 'ดึงข้อมูลรายการฝากเงินสำเร็จ',
      })
    }

    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    const whereClause: Prisma.DepositWhereInput = {
      ...(status ? { status: status as any } : {}),
      ...(userId ? { userId: userId as string } : {}),
    }

    const [deposits, totalDeposits] = await Promise.all([
      prisma.deposit.findMany({
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
      prisma.deposit.count({ where: whereClause }),
    ])

    return res.status(200).json({
      success: true,
      data: deposits,
      pagination: {
        totalItems: totalDeposits,
        totalPages: Math.ceil(totalDeposits / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูลรายการฝากเงินสำเร็จ',
    })
  } catch (error) {
    console.error('Get deposits error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการฝากเงิน',
    })
  }
}

// POST /api/deposits - สร้างคำขอฝากเงิน
export const createDeposit = async (req: Request, res: Response) => {
  try {
    const { userId, amount, slipImage } = req.body

    if (!userId || !amount || !slipImage) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      })
    }

    // ตรวจสอบว่ามี User อยู่จริง
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบผู้ใช้ที่ระบุ',
      })
    }

    // ดึง deposit rate ล่าสุดที่ active
    const activeRate = await prisma.depositRate.findFirst({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    const deposit = await prisma.deposit.create({
      data: {
        userId,
        amount: parseFloat(amount),
        slipImage,
        rate: activeRate?.rate || 1.0,
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
      data: deposit,
      message: 'สร้างคำขอฝากเงินสำเร็จ',
    })
  } catch (error) {
    console.error('Create deposit error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการสร้างคำขอฝากเงิน',
    })
  }
}

// PUT /api/deposits/approve - อนุมัติคำขอฝากเงิน
export const approveDeposit = async (req: Request, res: Response) => {
  try {
    const { id, comment } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ ID',
      })
    }

    const existingDeposit = await prisma.deposit.findUnique({
      where: { id },
      include: { user: { include: { wallet: true } } },
    })

    if (!existingDeposit) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบรายการฝากเงินที่ต้องการ',
      })
    }

    if (existingDeposit.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'รายการนี้ถูกดำเนินการแล้ว',
      })
    }

    // ใช้ Transaction เพื่อความปลอดภัย
    const result = await prisma.$transaction(async (tx) => {
      // อัพเดท Deposit status
      const updatedDeposit = await tx.deposit.update({
        where: { id },
        data: {
          status: 'APPROVED',
          comment,
        },
      })

      // คำนวณจำนวนเงินที่จะเพิ่ม (amount * rate)
      const creditAmount = existingDeposit.amount * existingDeposit.rate

      // อัพเดท Wallet balance
      const wallet = await tx.wallet.upsert({
        where: { userId: existingDeposit.userId },
        create: {
          userId: existingDeposit.userId,
          balance: creditAmount,
        },
        update: {
          balance: { increment: creditAmount },
        },
      })

      // สร้าง Transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: existingDeposit.userId,
          walletId: wallet.id,
          depositId: id,
          amount: creditAmount,
          type: 'DEPOSIT',
          status: 'COMPLETED',
        },
      })

      return { deposit: updatedDeposit, wallet, transaction }
    })

    return res.status(200).json({
      success: true,
      data: result,
      message: 'อนุมัติคำขอฝากเงินสำเร็จ',
    })
  } catch (error) {
    console.error('Approve deposit error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการอนุมัติคำขอฝากเงิน',
    })
  }
}

// PUT /api/deposits/reject - ปฏิเสธคำขอฝากเงิน
export const rejectDeposit = async (req: Request, res: Response) => {
  try {
    const { id, comment } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ ID',
      })
    }

    const existingDeposit = await prisma.deposit.findUnique({
      where: { id },
    })

    if (!existingDeposit) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบรายการฝากเงินที่ต้องการ',
      })
    }

    if (existingDeposit.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'รายการนี้ถูกดำเนินการแล้ว',
      })
    }

    const deposit = await prisma.deposit.update({
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
      data: deposit,
      message: 'ปฏิเสธคำขอฝากเงินสำเร็จ',
    })
  } catch (error) {
    console.error('Reject deposit error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการปฏิเสธคำขอฝากเงิน',
    })
  }
}
