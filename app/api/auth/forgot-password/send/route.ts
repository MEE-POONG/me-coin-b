import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, EmailTemplates } from '@/lib/email'
import crypto from 'crypto'

/**
 * POST /api/auth/forgot-password/send
 *
 * ส่งอีเมลรีเซ็ตรหัสผ่านไปยังผู้ใช้
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'กรุณาระบุ userId' }, { status: 400 })
    }

    // ค้นหาผู้ใช้
    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }

    // สร้าง reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

    // กำหนดเวลาหมดอายุ 24 ชั่วโมง (1 วัน)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // ลบ reset tokens เก่าของ user นี้ทั้งหมด
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    })

    // บันทึก token ใหม่ลงฐานข้อมูล
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    // สร้างลิงก์รีเซ็ตรหัสผ่าน
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // ตรวจสอบว่ามีการตั้งค่าอีเมลหรือไม่
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      console.warn('⚠️ Gmail credentials not configured')
      return NextResponse.json({
        success: true,
        message: 'ระบบไม่สามารถส่งอีเมลได้ เนื่องจากไม่ได้ตั้งค่า Email',
        resetToken, // สำหรับการทดสอบเท่านั้น (ควรลบในโปรดักชั่น)
      })
    }

    // ส่งอีเมล
    const template = EmailTemplates.resetPassword(user.username, resetLink)
    const emailResult = await sendEmail({
      to: user.email,
      ...template,
    })

    if (!emailResult.success) {
      console.error('❌ Failed to send email:', emailResult.error)
      return NextResponse.json({
        error: 'ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง',
      }, { status: 500 })
    }

    console.log('✅ Reset password email sent to:', user.email)

    return NextResponse.json({
      success: true,
      message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว',
    })
  } catch (error) {
    console.error('❌ Error in forgot password send:', error)
    return NextResponse.json({
      error: 'เกิดข้อผิดพลาดในการส่งอีเมล',
    }, { status: 500 })
  }
}
