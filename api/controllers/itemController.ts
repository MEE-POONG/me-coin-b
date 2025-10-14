import { Request, Response } from 'express'
import { prisma } from '../../src/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/items - ดึงรายการ Item
export const getItems = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      pageSize = '10',
      category = '',
      rarity = '',
      keyword = '',
      id = '',
    } = req.query

    if (id) {
      const item = await prisma.item.findUnique({
        where: { id: id as string },
        include: {
          _count: {
            select: {
              ownedItems: true,
            },
          },
        },
      })

      if (!item) {
        return res.status(404).json({
          success: false,
          error: 'ไม่พบไอเทมที่ต้องการ',
        })
      }

      return res.status(200).json({
        success: true,
        data: item,
        message: 'ดึงข้อมูลไอเทมสำเร็จ',
      })
    }

    const pageNum = parseInt(page as string, 10) || 1
    const pageSizeNum = parseInt(pageSize as string, 10) || 10
    const skip = (pageNum - 1) * pageSizeNum

    const whereClause: Prisma.ItemWhereInput = {
      ...(category ? { category: category as string } : {}),
      ...(rarity ? { rarity: rarity as any } : {}),
      ...(keyword
        ? {
          OR: [
            { name: { contains: keyword as string, mode: 'insensitive' } },
            { description: { contains: keyword as string, mode: 'insensitive' } },
          ],
        }
        : {}),
    }

    const [items, totalItems] = await Promise.all([
      prisma.item.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              ownedItems: true,
            },
          },
        },
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.item.count({ where: whereClause }),
    ])

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      },
      message: 'ดึงข้อมูลไอเทมสำเร็จ',
    })
  } catch (error) {
    console.error('Get items error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลไอเทม',
    })
  }
}

// POST /api/items - สร้างไอเทมใหม่
export const createItem = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl, category, rarity } = req.body

    if (!name || !description || !price || !category || !rarity) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      })
    }

    const item = await prisma.item.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        category,
        rarity,
      },
    })

    return res.status(201).json({
      success: true,
      data: item,
      message: 'สร้างไอเทมสำเร็จ',
    })
  } catch (error) {
    console.error('Create item error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการสร้างไอเทม',
    })
  }
}

// PUT /api/items - อัพเดทไอเทม
export const updateItem = async (req: Request, res: Response) => {
  try {
    const { id, name, description, price, imageUrl, category, rarity } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ ID',
      })
    }

    const existing = await prisma.item.findUnique({
      where: { id },
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบไอเทมที่ต้องการแก้ไข',
      })
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
        ...(price ? { price: parseFloat(price) } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(category ? { category } : {}),
        ...(rarity ? { rarity } : {}),
      },
    })

    return res.status(200).json({
      success: true,
      data: item,
      message: 'อัพเดทไอเทมสำเร็จ',
    })
  } catch (error) {
    console.error('Update item error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัพเดทไอเทม',
    })
  }
}

// DELETE /api/items - ลบไอเทม
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ ID',
      })
    }

    const existing = await prisma.item.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ownedItems: true,
          },
        },
      },
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบไอเทมที่ต้องการลบ',
      })
    }

    if (existing._count.ownedItems > 0) {
      return res.status(400).json({
        success: false,
        error: 'ไม่สามารถลบไอเทมที่มีผู้ใช้ครอบครองอยู่',
      })
    }

    await prisma.item.delete({
      where: { id },
    })

    return res.status(200).json({
      success: true,
      message: 'ลบไอเทมสำเร็จ',
    })
  } catch (error) {
    console.error('Delete item error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการลบไอเทม',
    })
  }
}

// POST /api/items/purchase - ซื้อไอเทม
export const purchaseItem = async (req: Request, res: Response) => {
  try {
    const { userId, itemId } = req.body

    if (!userId || !itemId) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ userId และ itemId',
      })
    }

    const [user, item] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      }),
      prisma.item.findUnique({
        where: { id: itemId },
      }),
    ])

    if (!user || !item) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบผู้ใช้หรือไอเทมที่ระบุ',
      })
    }

    if (!user.wallet) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบ Wallet ของผู้ใช้',
      })
    }

    if (user.wallet.balance < item.price) {
      return res.status(400).json({
        success: false,
        error: 'ยอดเงินในกระเป๋าไม่เพียงพอ',
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      const ownedItem = await tx.ownedItem.create({
        data: {
          userId,
          itemId,
        },
      })

      const purchase = await tx.purchase.create({
        data: {
          userId,
          ownedItemId: ownedItem.id,
        },
      })

      const wallet = await tx.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: item.price },
        },
      })

      const transaction = await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          purchaseId: purchase.id,
          amount: item.price,
          type: 'PURCHASE',
          status: 'COMPLETED',
        },
      })

      return { ownedItem, purchase, wallet, transaction }
    })

    return res.status(201).json({
      success: true,
      data: result,
      message: 'ซื้อไอเทมสำเร็จ',
    })
  } catch (error) {
    console.error('Purchase item error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการซื้อไอเทม',
    })
  }
}
