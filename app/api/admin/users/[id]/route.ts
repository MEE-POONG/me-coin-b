import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { ActivityLogger } from '@/lib/activity-logger'
import { getClientInfo } from '@/lib/get-client-info'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        discordId: true,
        email: true,
        username: true,
        accountNumber: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: {
            id: true,
            balance: true,
          },
        },
        _count: {
          select: {
            deposits: true,
            withdrawals: true,
            purchases: true,
            transactions: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { username, email, role, avatar } = body

    // ดึงข้อมูลเดิม
    const oldUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
      },
    })

    if (!oldUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // อัปเดต user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        username,
        email,
        role,
        avatar,
      },
      select: {
        id: true,
        discordId: true,
        email: true,
        username: true,
        accountNumber: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // บันทึก activity log
    const { ip, userAgent } = getClientInfo(request)
    await ActivityLogger.userUpdated(
      session.user.id,
      params.id,
      oldUser,
      updatedUser,
      ip,
      userAgent
    )

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ป้องกันการลบตัวเอง
    if (session.user.id === params.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    // ดึงข้อมูลก่อนลบ
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // ลบ user (cascade จะลบข้อมูลที่เกี่ยวข้องทั้งหมด)
    await prisma.user.delete({
      where: { id: params.id },
    })

    // บันทึก activity log
    const { ip, userAgent } = getClientInfo(request)
    await ActivityLogger.userDeleted(
      session.user.id,
      params.id,
      user,
      ip,
      userAgent
    )

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

