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

    // แปลง token เป็น hash เพื่อเทียบกับที่เก็บในฐานข้อมูล
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')



    // หา reset token (ไม่สนใจว่าหมดอายุหรือใช้แล้วหรือยัง - เพื่อให้ error message ถูกต้อง)
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        usedAt: true,
        expiresAt: true,
      },
    })

    // ตรวจสอบว่า token มีอยู่หรือไม่
    if (!resetToken) {

      return NextResponse.json({
        error: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบลิงก์ในอีเมลอีกครั้ง'
      }, { status: 400 })
    }

    // ตรวจสอบว่า token ถูกใช้ไปแล้วหรือยัง (One-Time Use)
    if (resetToken.usedAt) {

      return NextResponse.json({
        error: 'ลิงก์นี้ถูกใช้ไปแล้ว กรุณาขอลิงก์ใหม่หากต้องการรีเซ็ตรหัสผ่านอีกครั้ง'
      }, { status: 400 })
    }

    // ตรวจสอบว่า token หมดอายุหรือยัง
    if (resetToken.expiresAt < new Date()) {

      return NextResponse.json({
        error: 'ลิงก์หมดอายุแล้ว กรุณาขอลิงก์ใหม่'
      }, { status: 400 })
    }



    // ตรวจสอบว่าผู้ใช้มีอยู่จริง (ใช้ model User)
    const user = await prisma.adminUser.findUnique({
      where: { id: resetToken.userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ' }, { status: 404 })
    }

    // hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10)



    // ใช้ transaction เพื่อความปลอดภัย - อัปเดตรหัสผ่านและทำเครื่องหมาย token ว่าใช้แล้ว
    await prisma.$transaction([
      // อัปเดตรหัสผ่านในตาราง users
      prisma.adminUser.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),

      // ทำเครื่องหมาย token ว่าถูกใช้แล้ว (ONE-TIME USE)
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])



    // บันทึก activity log
    const { ip, userAgent } = getClientInfo(request)
    await ActivityLogger.userUpdated(
      user.id,   // actorId (หากให้เจ้าของบัญชีเป็นผู้กระทำ)
      user.id,   // targetId
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

    return NextResponse.json({
      error: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน กรุณาลองใหม่อีกครั้ง',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
