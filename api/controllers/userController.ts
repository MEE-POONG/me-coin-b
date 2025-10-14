import { Request, Response } from 'express'
import { prisma } from '../../src/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/users - ดึงรายการ User พร้อม pagination และ search
export const getUsers = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      keyword = '',
      role = '',
      id = '',
    } = req.query

    // ดึง User เดียว
    if (id) {
      const user = await prisma.user.findUnique({
        where: { id: id as string },
        include: {
          wallet: true,
          _count: {
            select: {
              deposits: true,
              withdrawals: true,
              purchases: true,
              sentGifts: true,
              receivedGifts: true,
            },
          },
        },
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'ไม่พบผู้ใช้ที่ต้องการ',
        })
      }

      // ลบ password ออกก่อนส่งกลับ
      const { password, ...userWithoutPassword } = user

      return res.status(200).json({
        success: true,
        data: userWithoutPassword,
        message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
      })
    }

    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    const whereClause: Prisma.UserWhereInput = {
      ...(role ? { role: role as any } : {}),
      ...(keyword
        ? {
          OR: [
            { username: { contains: keyword as string, mode: 'insensitive' } },
            { email: { contains: keyword as string, mode: 'insensitive' } },
            { accountNumber: { contains: keyword as string, mode: 'insensitive' } },
          ],
        }
        : {}),
    }

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          wallet: true,
          _count: {
            select: {
              deposits: true,
              withdrawals: true,
              purchases: true,
            },
          },
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: whereClause }),
    ])

    // ลบ password ออก
    const usersWithoutPasswords = users.map(({ password, ...user }) => user)

    return res.status(200).json({
      success: true,
      data: usersWithoutPasswords,
      pagination: {
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
    })
  } catch (error) {
    console.error('Get users error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
    })
  }
}

// PUT /api/users - อัพเดทข้อมูล User
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id, username, email, avatar, role } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ ID',
      })
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข',
      })
    }

    // ตรวจสอบ username ซ้ำ
    if (username) {
      const duplicateUsername = await prisma.user.findFirst({
        where: {
          username,
          id: { not: id },
        },
      })

      if (duplicateUsername) {
        return res.status(400).json({
          success: false,
          error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว',
        })
      }
    }

    // ตรวจสอบ email ซ้ำ
    if (email) {
      const duplicateEmail = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      })

      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          error: 'อีเมลนี้ถูกใช้งานแล้ว',
        })
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(username ? { username } : {}),
        ...(email ? { email } : {}),
        ...(avatar ? { avatar } : {}),
        ...(role ? { role } : {}),
      },
      include: {
        wallet: true,
      },
    })

    const { password, ...userWithoutPassword } = user

    return res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: 'อัพเดทข้อมูลผู้ใช้สำเร็จ',
    })
  } catch (error) {
    console.error('Update user error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลผู้ใช้',
    })
  }
}

// GET /api/users/:id/transactions - ดึง Transaction history ของ User
export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      page = '1',
      pageSize = '10',
      type = '',
      status = '',
    } = req.query

    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    const whereClause: Prisma.TransactionWhereInput = {
      userId: id,
      ...(type ? { type: type as any } : {}),
      ...(status ? { status: status as any } : {}),
    }

    const [transactions, totalTransactions] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          deposit: true,
          withdrawal: true,
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
                select: { id: true, username: true, avatar: true },
              },
              recipient: {
                select: { id: true, username: true, avatar: true },
              },
            },
          },
          transfer: {
            include: {
              sender: {
                select: { id: true, username: true, avatar: true },
              },
              receiver: {
                select: { id: true, username: true, avatar: true },
              },
            },
          },
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.count({ where: whereClause }),
    ])

    return res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        totalItems: totalTransactions,
        totalPages: Math.ceil(totalTransactions / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูล Transaction สำเร็จ',
    })
  } catch (error) {
    console.error('Get user transactions error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูล Transaction',
    })
  }
}
