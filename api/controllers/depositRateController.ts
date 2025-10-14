import { Request, Response } from 'express'
import { prisma } from '../../src/lib/prisma'

// GET /api/deposit-rates - ดึงรายการอัตราแลกเปลี่ยน
export const getDepositRates = async (req: Request, res: Response) => {
  try {
    const { isActive, id } = req.query

    if (id) {
      const rate = await prisma.depositRate.findUnique({
        where: { id: id as string },
      })

      if (!rate) {
        return res.status(404).json({
          success: false,
          error: 'ไม่พบอัตราแลกเปลี่ยนที่ต้องการ',
        })
      }

      return res.status(200).json({
        success: true,
        data: rate,
        message: 'ดึงข้อมูลอัตราแลกเปลี่ยนสำเร็จ',
      })
    }

    const rates = await prisma.depositRate.findMany({
      where: {
        ...(isActive !== undefined ? { isActive: isActive === 'true' } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({
      success: true,
      data: rates,
      message: 'ดึงข้อมูลอัตราแลกเปลี่ยนสำเร็จ',
    })
  } catch (error) {
    console.error('Get deposit rates error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลอัตราแลกเปลี่ยน',
    })
  }
}

// GET /api/deposit-rates/active - ดึงอัตราแลกเปลี่ยนที่ใช้งานได้ปัจจุบัน
export const getActiveDepositRate = async (req: Request, res: Response) => {
  try {
    const now = new Date()

    const rate = await prisma.depositRate.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!rate) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบอัตราแลกเปลี่ยนที่ใช้งานได้ในปัจจุบัน',
      })
    }

    return res.status(200).json({
      success: true,
      data: rate,
      message: 'ดึงข้อมูลอัตราแลกเปลี่ยนปัจจุบันสำเร็จ',
    })
  } catch (error) {
    console.error('Get active deposit rate error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการดึงข้อมูลอัตราแลกเปลี่ยนปัจจุบัน',
    })
  }
}

// POST /api/deposit-rates - สร้างอัตราแลกเปลี่ยนใหม่
export const createDepositRate = async (req: Request, res: Response) => {
  try {
    const { name, rate, startDate, endDate, isActive } = req.body

    if (!name || !rate || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      })
    }

    const depositRate = await prisma.depositRate.create({
      data: {
        name,
        rate: parseFloat(rate),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return res.status(201).json({
      success: true,
      data: depositRate,
      message: 'สร้างอัตราแลกเปลี่ยนสำเร็จ',
    })
  } catch (error) {
    console.error('Create deposit rate error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการสร้างอัตราแลกเปลี่ยน',
    })
  }
}

// PUT /api/deposit-rates - อัพเดทอัตราแลกเปลี่ยน
export const updateDepositRate = async (req: Request, res: Response) => {
  try {
    const { id, name, rate, startDate, endDate, isActive } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ ID',
      })
    }

    const existing = await prisma.depositRate.findUnique({
      where: { id },
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบอัตราแลกเปลี่ยนที่ต้องการแก้ไข',
      })
    }

    const depositRate = await prisma.depositRate.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(rate ? { rate: parseFloat(rate) } : {}),
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    })

    return res.status(200).json({
      success: true,
      data: depositRate,
      message: 'อัพเดทอัตราแลกเปลี่ยนสำเร็จ',
    })
  } catch (error) {
    console.error('Update deposit rate error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการอัพเดทอัตราแลกเปลี่ยน',
    })
  }
}

// DELETE /api/deposit-rates - ลบอัตราแลกเปลี่ยน
export const deleteDepositRate = async (req: Request, res: Response) => {
  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ ID',
      })
    }

    const existing = await prisma.depositRate.findUnique({
      where: { id },
    })

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'ไม่พบอัตราแลกเปลี่ยนที่ต้องการลบ',
      })
    }

    await prisma.depositRate.delete({
      where: { id },
    })

    return res.status(200).json({
      success: true,
      message: 'ลบอัตราแลกเปลี่ยนสำเร็จ',
    })
  } catch (error) {
    console.error('Delete deposit rate error:', error)
    return res.status(500).json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการลบอัตราแลกเปลี่ยน',
    })
  }
}
