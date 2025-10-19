import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/users?search={identifier}
 *
 * Public endpoint for forgot password - searches for user by email, username, or discordId
 * Returns minimal user info with masked email for security
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    if (!search) {
      return NextResponse.json({ error: 'กรุณาระบุข้อมูลที่ต้องการค้นหา' }, { status: 400 })
    }

    const searchTerm = search.trim()

    // ค้นหาผู้ใช้จาก email, username, หรือ discordId
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: searchTerm, mode: 'insensitive' } },
          { username: { equals: searchTerm, mode: 'insensitive' } },
          { discordId: { equals: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    })

    if (!user) {
      return NextResponse.json({ user: null })
    }

    // สร้าง masked email เพื่อความปลอดภัย
    const maskedEmail = maskEmail(user.email)

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        maskedEmail,
      },
    })
  } catch (error) {
    console.error('Error searching user:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการค้นหา' }, { status: 500 })
  }
}

/**
 * Mask email address for security
 * Example: user@example.com -> u***@example.com
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return email

  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`
  }

  const visibleChars = Math.min(2, Math.floor(localPart.length / 3))
  const masked = localPart.slice(0, visibleChars) + '***'
  return `${masked}@${domain}`
}
