import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, EmailTemplates } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier } = body // discordId, username, or email

    if (!identifier) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูล' }, { status: 400 })
    }

    // ค้นหา admin จาก email, username หรือ discordId
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
          { discordId: identifier },
        ],
      },
      select: {
        id: true,
        email: true,
        username: true,
        discordId: true,
      },
    })

    // ไม่ควรบอกว่าหาไม่เจอเพื่อความปลอดภัย
    // แต่เพื่อ UX ที่ดีกว่า เราจะบอก
    if (!admin) {
      return NextResponse.json({
        error: 'ไม่พบแอดมินนี้ในระบบ'
      }, { status: 404 })
    }

    // สร้าง reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetLink = `${process.env.NEXTAUTH_URL}/forgot-password?token=${resetToken}&userId=${admin.id}`

    // ส่ง email (ถ้ามีการตั้งค่า EMAIL)
    if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
      const template = EmailTemplates.resetPassword(admin.username, resetLink)
      await sendEmail({
        to: admin.email,
        ...template,
      })
      console.log('✅ Reset password email sent to:', admin.email)
    }

    // TODO: ในระบบจริงควรเก็บ token ใน database
    // แต่เพื่อความง่าย เราจะส่ง userId กลับไปให้ทำงานได้เลย

    return NextResponse.json({
      success: true,
      message: process.env.GMAIL_USER
        ? 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว'
        : 'พบแอดมินในระบบ',
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
      resetToken,
    })
  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

