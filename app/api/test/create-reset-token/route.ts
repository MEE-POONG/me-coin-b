import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

/**
 * POST /api/test/create-reset-token
 *
 * สร้าง reset token ทดสอบ (ใช้สำหรับ development เท่านั้น)
 */
export async function POST(request: NextRequest) {
  // เฉพาะ development mode เท่านั้น
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'กรุณาระบุอีเมล' }, { status: 400 })
    }

    // ค้นหา user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }

    // สร้าง reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

    // กำหนดเวลาหมดอายุ 24 ชั่วโมง
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // ลบ token เก่าของ user นี้ก่อน (ถ้ามี)
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    })

    // สร้าง token ใหม่
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    // สร้างลิงก์รีเซ็ตรหัสผ่าน
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    return NextResponse.json({
      success: true,
      message: 'สร้าง reset token สำเร็จ',
      user: {
        username: user.username,
        email: user.email,
      },
      resetLink,
      token: resetToken,
      expiresAt,
    })
  } catch (error) {
    console.error('❌ Error creating reset token:', error)
    return NextResponse.json({
      error: 'เกิดข้อผิดพลาด',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
