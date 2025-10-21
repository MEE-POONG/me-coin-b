import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ตรวจสอบว่าเป็น Admin หรือดูของตัวเอง
    if (session.user.role !== 'ADMIN' && session.user.id !== params.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: params.userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    return NextResponse.json(wallet)
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - สำหรับ Admin ปรับยอดเงิน (Manual adjustment)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { adjustment, reason } = body

    if (!adjustment || adjustment === 0) {
      return NextResponse.json({ error: 'Invalid adjustment amount' }, { status: 400 })
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: params.userId },
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // อัปเดต balance
    const updatedWallet = await prisma.wallet.update({
      where: { userId: params.userId },
      data: {
        balance: {
          increment: adjustment,
        },
      },
    })

    // สร้าง transaction log
    await prisma.transaction.create({
      data: {
        amount: Math.abs(adjustment),
        type: adjustment > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
        status: 'COMPLETED',
        userId: params.userId,
        walletId: wallet.id,
      },
    })

    // Log activity
    const { logActivity } = await import('@/lib/activity-logger')
    const { getClientInfo } = await import('@/lib/get-client-info')
    const { ip, userAgent } = getClientInfo(request)

    await logActivity({
      userId: session.user.id,
      action: 'UPDATE',
      model: 'Wallet',
      modelId: wallet.id,
      oldData: { balance: wallet.balance },
      newData: { balance: updatedWallet.balance },
      description: `Admin ปรับยอดเงิน ${adjustment > 0 ? '+' : ''}${adjustment} บาท${reason ? `: ${reason}` : ''}`,
      ipAddress: ip,
      userAgent,
    })

    return NextResponse.json(updatedWallet)
  } catch (error) {
    console.error('Error updating wallet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

