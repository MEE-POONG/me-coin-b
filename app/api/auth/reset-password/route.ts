import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { ActivityLogger } from '@/lib/activity-logger'
import { getClientInfo } from '@/lib/get-client-info'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, newPassword, confirmPassword } = body

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'รหัสผ่านไม่ตรงกัน' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 })
    }

    // Hash token เพื่อเทียบกับที่เก็บใน database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    // ค้นหา token ที่ถูกต้อง และยังไม่หมดอายุ
    // อนุญาตให้ใช้ซ้ำได้หลายครั้งจนกว่าจะหมดอายุ
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() }, // ยังไม่หมดอายุ
      },
      select: {
        id: true,
        userId: true,
        usedAt: true,
      },
    })

    if (!resetToken) {
      // Debug: ค้นหา token เพื่อดูสาเหตุ
      const debugToken = await prisma.passwordResetToken.findFirst({
        where: { tokenHash },
        select: {
          id: true,
          expiresAt: true,
          usedAt: true,
        },
      })

      let errorMessage = 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว'

      if (debugToken) {
        if (debugToken.expiresAt < new Date()) {
          errorMessage = 'ลิงก์หมดอายุแล้ว กรุณาขอลิงก์ใหม่'
        }
      } else {
        errorMessage = 'ลิงก์ไม่ถูกต้อง กรุณาตรวจสอบลิงก์ในอีเมลอีกครั้ง'
      }

      console.log('Reset password failed:', {
        hasToken: !!debugToken,
        isExpired: debugToken ? debugToken.expiresAt < new Date() : null,
        isUsed: debugToken ? !!debugToken.usedAt : null
      })

      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    // ตรวจสอบว่า admin มีอยู่จริง
    const admin = await prisma.adminUser.findUnique({
      where: { id: resetToken.userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    })

    if (!admin) {
      return NextResponse.json({ error: 'ไม่พบแอดมินนี้ในระบบ' }, { status: 404 })
    }

    // Hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // อัปเดตรหัสผ่าน
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
      },
    })

    // อัปเดต usedAt ให้เป็นเวลาปัจจุบัน (แต่ยังสามารถใช้ซ้ำได้จนกว่าจะหมดอายุ)
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        usedAt: new Date(),
      },
    })

    // บันทึก activity log
    const { ip, userAgent } = getClientInfo(request)
    await ActivityLogger.userUpdated(
      admin.id,
      admin.id,
      { password: '***' },
      { password: '***' },
      ip,
      userAgent
    )

    return NextResponse.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
    })
  } catch (error) {
    console.error('❌ Error resetting password:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({
      error: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน กรุณาลองใหม่อีกครั้ง',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

