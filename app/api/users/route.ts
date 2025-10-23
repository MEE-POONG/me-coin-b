import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { PaginationResponse } from '@/types'
import { Prisma } from '@prisma/client'

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


/** แปลง query param -> boolean | undefined (รองรับ 'true'|'false'|ไม่ส่งมา) */
function parseBoolParam(v: string | null): boolean | undefined {
  if (v == null) return undefined
  const s = v.trim().toLowerCase()
  if (s === 'true') return true
  if (s === 'false') return false
  return undefined
}

/** ปลอดภัยเรื่องชื่อฟิลด์สำหรับ orderBy */
const USER_SORT_WHITELIST: (keyof Prisma.UserOrderByWithRelationInput)[] = [
  'createdAt', 'updatedAt', 'username', 'email', 'id'
]

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)

    // --- page / pageSize: กันค่าผิด และ clamp ---
    const rawPage = Number(searchParams.get('page') ?? '1')
    const rawPageSize = Number(searchParams.get('pageSize') ?? '10')

    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1
    const pageSizeUnclamped =
      Number.isFinite(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10
    const pageSize = Math.min(100, Math.max(1, pageSizeUnclamped)) // 1..100

    const keyword = (searchParams.get('keyword') ?? '').trim()

    // --- sortBy/sortOrder: กันค่า ---
    const sortByParam = (searchParams.get('sortBy') ?? 'createdAt') as keyof Prisma.UserOrderByWithRelationInput
    const sortBy = USER_SORT_WHITELIST.includes(sortByParam) ? sortByParam : 'createdAt'
    const sortOrder: Prisma.SortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    // --- isDeleted: รองรับ tri-state (ไม่ระบุ/true/false) ---
    const isDeletedParam = parseBoolParam(searchParams.get('isDeleted'))
    // ถ้าอยากดีฟอลต์เป็น false (แสดงเฉพาะที่ไม่ถูกลบ) ให้ตั้งแบบนี้:
    const isDeleted = isDeletedParam ?? false

    // --- where ---
    const where: Prisma.UserWhereInput = {
      isDeleted,
      ...(keyword
        ? {
          OR: [
            { username: { contains: keyword, mode: 'insensitive' } },
            { email: { contains: keyword, mode: 'insensitive' } },
          ],
        }
        : {}),
    }

    // --- count + คำนวณหน้าแบบปลอดภัย ---
    const totalItems = await prisma.user.count({ where })
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize)) // อย่างน้อย 1
    const safePage = Math.min(Math.max(page, 1), totalPages) // clamp 1..totalPages
    const skip = (safePage - 1) * pageSize // ไม่มีทางติดลบ

    // --- query ---
    const users = await prisma.user.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: pageSize,
      include: {
        wallet: true,
      },
    })

    const response: PaginationResponse = {
      page: safePage,            // ส่งหน้าที่ระบบใช้จริงกลับไป
      pageSize,
      currentPage: safePage,
      keyword,
      sortBy: String(sortBy),
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
        role: 'NORMAL',

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
