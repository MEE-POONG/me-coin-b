import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - ดึงรายการ admin ทั้งหมด
export async function GET(request: NextRequest) {
  try {


    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''


    const where = search ? {
      OR: [
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const admin = await prisma.adminUser.findFirst({
      where,
    })

    return NextResponse.json({
      success: true,
      data: admin,
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
