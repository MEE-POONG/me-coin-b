import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { PaginationResponse } from '@/types'

const baseUserSelect = {
  id: true,
  discordId: true,
  email: true,
  username: true,
  accountNumber: true,
  avatar: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ ดึง query parameters
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.max(1, parseInt(searchParams.get('pageSize') || '10'))
    const keyword = searchParams.get('keyword') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
    const isDeleted = searchParams.get('isDeleted') === 'false'

    // ✅ กรองข้อมูล (ตัวอย่างสำหรับ users)
    const where: any = {
      isDeleted,
    }

    // ✅ นับทั้งหมด
    const totalItems = await prisma.user.count({ where })
    const totalPages = Math.ceil(totalItems / pageSize)
    const safePage = Math.min(page, totalPages)
    // ✅ ดึงข้อมูลตามหน้า
    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    })

    // ✅ สร้าง response แบบ PaginationResponse
    const response: PaginationResponse = {
      page,
      pageSize,
      currentPage: page,
      keyword,
      sortBy,
      sortOrder,
      totalItems,
      totalPages,
      isDeleted,
    }

    return NextResponse.json({ pagination: response, data: users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { email, password, username, accountNumber, avatar, role } = body ?? {}

    // inline checks (แทน zod)
    if (
      !email || typeof email !== 'string' ||
      !password || typeof password !== 'string' || password.length < 8 ||
      !username || typeof username !== 'string' || username.length < 3 ||
      !accountNumber || typeof accountNumber !== 'string' || accountNumber.length < 3
    ) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        username,
        accountNumber,
        avatar: avatar ?? undefined,
        role: role === 'ADMIN' ? 'ADMIN' : 'NORMAL',
      },
      select: baseUserSelect,
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error('Users POST error:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Email/username/accountNumber already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
