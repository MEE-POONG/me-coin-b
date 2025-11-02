import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, comment } = body

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
    }

    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 })
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: withdrawal.userId },
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // อัปเดต withdrawal status
    const updatedWithdrawal = await prisma.withdrawal.update({
      where: { id: params.id },
      data: {
        status,
        comment,
      },
    })

    // ถ้า APPROVED ให้หักเงินจาก wallet และสร้าง transaction
    if (status === 'APPROVED') {
      if (wallet.balance < withdrawal.amount) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
      }

      const [updatedWallet] = await prisma.$transaction([
        prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              decrement: withdrawal.amount,
            },
          },
        }),
        prisma.transaction.create({
          data: {
            amount: withdrawal.amount,
            type: 'WITHDRAWAL',
            status: 'COMPLETED',
            userId: withdrawal.userId,
            walletId: wallet.id,
            withdrawalId: withdrawal.id,
          },
        }),
      ])

      // ส่ง email แจ้งเตือน
      if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
        const { sendEmail, EmailTemplates } = await import('@/lib/email')
        const template = EmailTemplates.withdrawalApproved(
          withdrawal.user.username,
          withdrawal.amount,
          updatedWallet.balance
        )
        await sendEmail({
          to: withdrawal.user.email,
          ...template,
        })
        console.log('✅ Withdrawal approved email sent to:', withdrawal.user.email)
      }
    } else if (status === 'REJECTED') {
      // สร้าง transaction failed
      await prisma.transaction.create({
        data: {
          amount: withdrawal.amount,
          type: 'WITHDRAWAL',
          status: 'FAILED',
          userId: withdrawal.userId,
          walletId: wallet.id,
          withdrawalId: withdrawal.id,
        },
      })

      // ส่ง email แจ้งเตือนการปฏิเสธ (optional)
      if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD && comment) {
        const { sendEmail, EmailTemplates } = await import('@/lib/email')
        const template = EmailTemplates.depositRejected(
          withdrawal.user.username,
          withdrawal.amount,
          comment
        )
        template.subject = '❌ คำขอถอนเงินถูกปฏิเสธ - MeCoins'
        await sendEmail({
          to: withdrawal.user.email,
          ...template,
        })
        console.log('✅ Withdrawal rejected email sent to:', withdrawal.user.email)
      }
    }

    return NextResponse.json(updatedWithdrawal)
  } catch (error) {
    console.error('Error updating withdrawal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

