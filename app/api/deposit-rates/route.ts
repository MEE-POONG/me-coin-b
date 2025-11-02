import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where = activeOnly ? { isActive: true } : {}

    const depositRates = await prisma.depositRate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(depositRates)
  } catch (error) {
    console.error('Error fetching deposit rates:', error)
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
    const { name, rate, startDate, endDate, isActive } = body

    if (!name || !rate || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const depositRate = await prisma.depositRate.create({
      data: {
        name,
        rate,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(depositRate, { status: 201 })
  } catch (error) {
    console.error('Error creating deposit rate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

