import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = params.id
    const body = await request.json()

    const data: any = {}

    if (typeof body.email === 'string') data.email = body.email
    if (typeof body.username === 'string') data.username = body.username
    if (typeof body.role === 'string') data.role = body.role
    if (typeof body.discordId === 'string' || body.discordId === null) data.discordId = body.discordId
    if (typeof body.accountNumber === 'string') data.accountNumber = body.accountNumber
    if (typeof body.avatar === 'string') data.avatar = body.avatar

    if (typeof body.password === 'string' && body.password.length > 0) {
      data.password = await bcrypt.hash(body.password, 10)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
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

    return NextResponse.json({ user: updated })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const fields = (error?.meta?.target as string[])?.join(', ')
      return NextResponse.json({ error: `ข้อมูลซ้ำในฟิลด์: ${fields}` }, { status: 409 })
    }
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = params.id

    // ลบจริง (hard delete). หากอยาก soft delete ให้เพิ่มฟิลด์ isDeleted ที่ model แล้วเปลี่ยนเป็น update
    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })
    }
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
