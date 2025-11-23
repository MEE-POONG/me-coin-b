import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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
    const { name, rate, startDate, endDate, isActive } = body

    const depositRate = await prisma.depositRate.update({
      where: { id: params.id },
      data: {
        name,
        rate,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      },
    })

    return NextResponse.json(depositRate)
  } catch (error) {
    console.error('Error updating deposit rate:', error)
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

    await prisma.depositRate.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Deposit rate deleted successfully' })
  } catch (error) {
    console.error('Error deleting deposit rate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

