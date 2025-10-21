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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: baseUserSelect,
    })
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(me)
  } catch (error) {
    console.error('Me GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { username, avatar } = body ?? {}

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(typeof username === 'string' ? { username } : {}),
        ...(typeof avatar === 'string' ? { avatar } : {}),
      },
      select: baseUserSelect,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Me PUT error:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint conflict' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** เปลี่ยนรหัสผ่าน: ส่ง { currentPassword, newPassword } */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = body ?? {}

    if (
      typeof currentPassword !== 'string' || currentPassword.length < 8 ||
      typeof newPassword !== 'string' || newPassword.length < 8
    ) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const me = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!me) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const ok = await bcrypt.compare(currentPassword, me.password)
    if (!ok) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: newHash },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Me PATCH (change password) error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
