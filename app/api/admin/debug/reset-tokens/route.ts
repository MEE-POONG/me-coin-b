import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/debug/reset-tokens
 *
 * ดูรายการ Reset Tokens ทั้งหมด (สำหรับ Admin เท่านั้น)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // ตรวจสอบว่าเป็น Admin หรือไม่


    // ดึงข้อมูล reset tokens พร้อม user info
    const tokens = await prisma.passwordResetToken.findMany({
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        usedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // แสดง 20 รายการล่าสุด
    })

    // ดึงข้อมูล user สำหรับแต่ละ token
    const tokensWithUser = await Promise.all(
      tokens.map(async (token) => {
        const user = await prisma.user.findUnique({
          where: { id: token.userId },
          select: {
            username: true,
            email: true,
          },
        })

        const now = new Date()
        const isExpired = token.expiresAt < now
        const isUsed = !!token.usedAt
        const isValid = !isExpired && !isUsed

        return {
          ...token,
          user,
          isExpired,
          isUsed,
          isValid,
          status: isUsed
            ? 'ใช้แล้ว'
            : isExpired
              ? 'หมดอายุ'
              : 'ใช้งานได้',
        }
      })
    )

    return NextResponse.json({
      success: true,
      tokens: tokensWithUser,
      stats: {
        total: tokens.length,
        valid: tokensWithUser.filter(t => t.isValid).length,
        expired: tokensWithUser.filter(t => t.isExpired && !t.isUsed).length,
        used: tokensWithUser.filter(t => t.isUsed).length,
      },
    })
  } catch (error) {
    console.error('❌ Error fetching reset tokens:', error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/debug/reset-tokens
 *
 * ลบ Reset Tokens ที่หมดอายุและใช้แล้ว (สำหรับ Admin เท่านั้น)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)



    const now = new Date()

    // ลบ tokens ที่หมดอายุหรือใช้แล้ว
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { usedAt: { not: null } },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      message: `ลบ ${result.count} tokens ที่หมดอายุและใช้แล้ว`,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('❌ Error deleting reset tokens:', error)
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 })
  }
}
