import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET - ดึงรายการ admin ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const currentAdmin = await prisma.adminUser.findUnique({
      where: { id: session.user.id }
    })

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * pageSize

    const where = search ? {
      OR: [
        { username: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const [admins, total] = await Promise.all([
      prisma.adminUser.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'asc' as const }
      }),
      prisma.adminUser.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: admins,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize
      }
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - สร้าง admin ใหม่
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const currentAdmin = await prisma.adminUser.findUnique({
      where: { id: session.user.id }
    })

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { email, username, password, name, phone, accountNumber, accountType, accountName } = body

    // Validate required fields
    if (!email || !username || !password || !accountNumber) {
      return NextResponse.json(
        { error: 'Email, username, password, and account number are required' },
        { status: 400 }
      )
    }

    // Check if email or username already exists
    const existingAdmin = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email },
          { username },
          { accountNumber }
        ]
      }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Email, username, or account number already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin
    const newAdmin = await prisma.adminUser.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: name || null,
        phone: phone || null,
        accountNumber,
        accountType: accountType || null,
        accountName: accountName || null
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        phone: true,
        accountNumber: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: newAdmin,
      message: 'Admin created successfully'
    })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
