import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type SortBy = 'createdAt' | 'updatedAt' | 'username' | 'email' | 'role'
type SortOrder = 'asc' | 'desc'

/** สร้าง orderBy จากพารามิเตอร์ โดยอนุญาตเฉพาะคีย์ที่รองรับ */
function buildOrderBy(sortBy?: string | null, sortOrder?: string | null) {
  const safeSortBy: SortBy = (['createdAt','updatedAt','username','email','role'].includes(String(sortBy)) 
    ? (sortBy as SortBy) 
    : 'createdAt')
  const safeOrder: SortOrder = (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder : 'desc'
  return { [safeSortBy]: safeOrder } as Record<SortBy, SortOrder>
}

/** สร้าง where จากพารามิเตอร์ search/keyword/typeSearch/status */
function buildWhere(params: {
  search?: string | null
  typeSearch?: string | null
  keyword?: string | null
  status?: string | null
}) {
  const { search, typeSearch, keyword, status } = params
  const AND: any[] = []

  // keyword -> ค้นหาเฉพาะ username
  if (keyword) {
    AND.push({
      username: {
        contains: String(keyword),
        mode: 'insensitive' as const,
      },
    })
  }

  // search + typeSearch -> ค้นหาตามฟิลด์ที่ระบุ
  if (search) {
    const term = String(search)
    const t = (typeSearch || '').toLowerCase()
    if (t === 'discordid') {
      AND.push({
        discordId: {
          contains: term,
          mode: 'insensitive' as const,
        },
      })
    } else if (t === 'email') {
      AND.push({
        email: {
          contains: term,
          mode: 'insensitive' as const,
        },
      })
    } else if (t === 'username') {
      AND.push({
        username: {
          contains: term,
          mode: 'insensitive' as const,
        },
      })
    } else {
      // ถ้าไม่ได้ระบุ typeSearch ที่รองรับ -> ให้ค้นหาแบบ OR ในสามฟิลด์
      AND.push({
        OR: [
          { discordId: { contains: term, mode: 'insensitive' as const } },
          { email:     { contains: term, mode: 'insensitive' as const } },
          { username:  { contains: term, mode: 'insensitive' as const } },
        ],
      })
    }
  }

  // status -> role (รองรับคอมมา)
  if (status) {
    const roles = String(status)
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    if (roles.length > 0) {
      AND.push({ role: { in: roles as any[] } })
    }
  }

  return AND.length ? { AND } : {}
}

/** รูปแบบ PaginationResponse ตามที่ผู้ใช้กำหนด */
interface PaginationResponse {
  page: number
  pageSize: number
  keyword: string
  typeKeyword?: string
  status?: string
  sortBy?: string
  sortOrder?: string
  search?: string
  typeSearch?: string
  totalItems?: number
  totalPages: number
  isActive?: boolean
  isDeleted?: boolean
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sp = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(sp.get('pageSize') || '10', 10)))
    const search = sp.get('search')
    const typeSearch = sp.get('typeSearch') // discordId | email | username
    const keyword = sp.get('keyword') || '' // username only
    const status = sp.get('status') // role filter
    const sortBy = sp.get('sortBy') // createdAt|updatedAt|username|email|role
    const sortOrder = sp.get('sortOrder') // asc|desc

    const skip = (page - 1) * pageSize
    const where = buildWhere({ search, typeSearch, keyword, status })
    const orderBy = buildOrderBy(sortBy, sortOrder)

    const [users, totalItems] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          discordId: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    const pagination: PaginationResponse = {
      page,
      pageSize,
      keyword,
      typeKeyword: 'username',
      status: status || undefined,
      sortBy: (sortBy as string) || 'createdAt',
      sortOrder: (sortOrder as string) || 'desc',
      search: search || undefined,
      typeSearch: typeSearch || undefined,
      totalItems,
      totalPages,
      // isActive / isDeleted ไม่ได้ใช้เพราะ model ไม่มี
    }

    return NextResponse.json({ users, pagination })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // รับค่าเบื้องต้น
    const {
      email,
      username,
      password,
      role,          // optional
      discordId,     // optional
      accountNumber, // optional
      avatar,        // optional
    } = body || {}

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'email, username, password เป็นข้อมูลบังคับ' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const created = await prisma.user.create({
      data: {
        email,
        username,
        password: hashed,
        role: role || 'NORMAL',
        discordId: discordId || null,
        accountNumber: accountNumber || undefined,
        avatar: avatar || undefined,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        discordId: true,
        accountNumber: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: created }, { status: 201 })
  } catch (error: any) {
    // Prisma unique constraint
    if (error?.code === 'P2002') {
      const fields = (error?.meta?.target as string[])?.join(', ')
      return NextResponse.json({ error: `ข้อมูลซ้ำในฟิลด์: ${fields}` }, { status: 409 })
    }
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
