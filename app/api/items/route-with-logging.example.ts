// ตัวอย่างการใช้ Activity Logger ใน Item API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ActivityLogger } from '@/lib/activity-logger'
import { getClientInfo } from '@/lib/get-client-info'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, imageUrl, category, rarity } = body

    if (!name || !description || !price || !category || !rarity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // สร้าง item
    const item = await prisma.item.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        category,
        rarity,
      },
    })

    // 🔥 บันทึก activity log
    const { ip, userAgent } = getClientInfo(request)
    await ActivityLogger.itemCreated(
      session.user.id,
      item,
      ip,
      userAgent
    )

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE_EXAMPLE(
  request: NextRequest,
  itemId: string
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ดึงข้อมูลก่อนลบ เพื่อเก็บ log
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // ลบ item
    await prisma.item.delete({
      where: { id: itemId },
    })

    // 🔥 บันทึก activity log
    const { ip, userAgent } = getClientInfo(request)
    await ActivityLogger.itemDeleted(
      session.user.id,
      itemId,
      item,
      ip,
      userAgent
    )

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

