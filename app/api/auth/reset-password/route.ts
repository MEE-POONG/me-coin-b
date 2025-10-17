import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { ActivityLogger } from '@/lib/activity-logger'
import { getClientInfo } from '@/lib/get-client-info'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newPassword, confirmPassword } = body

    if (!userId || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'รหัสผ่านไม่ตรงกัน' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 })
    }

    // ตรวจสอบว่า user มีอยู่จริง
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้นี้ในระบบ' }, { status: 404 })
    }

    // Hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // อัปเดตรหัสผ่าน
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    })

    // บันทึก activity log
    const { ip, userAgent } = getClientInfo(request)
    await ActivityLogger.logActivity({
      userId: userId,
      action: 'UPDATE',
      model: 'User',
      modelId: userId,
      description: 'รีเซ็ตรหัสผ่าน',
      ipAddress: ip,
      userAgent,
    })

    return NextResponse.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

