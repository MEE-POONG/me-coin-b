import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: baseUserSelect,
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(user)
  } catch (error) {
    console.error('User GET by id error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      email, username, accountNumber, avatar, role, password,
    } = body ?? {}

    const data: any = {}
    if (typeof email === 'string') data.email = email
    if (typeof username === 'string') data.username = username
    if (typeof accountNumber === 'string') data.accountNumber = accountNumber
    if (typeof avatar === 'string') data.avatar = avatar
    if (role === 'ADMIN' || role === 'NORMAL') data.role = role
    if (typeof password === 'string' && password.length >= 8) {
      data.password = await bcrypt.hash(password, 12)
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: baseUserSelect,
    })
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('User PUT by id error:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint conflict' }, { status: 409 })
    }
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('User DELETE by id error:', error)
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
