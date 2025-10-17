import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const deposit = await prisma.deposit.findUnique({
      where: { id: params.id },
      include: { user: true },
    })

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 })
    }

    if (deposit.status !== 'PENDING') {
      return NextResponse.json({ error: 'Deposit already processed' }, { status: 400 })
    }

    // อัปเดต deposit status
    const updatedDeposit = await prisma.deposit.update({
      where: { id: params.id },
      data: {
        status,
        comment,
      },
    })

    // ถ้า APPROVED ให้เพิ่มเงินเข้า wallet และสร้าง transaction
    if (status === 'APPROVED') {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: deposit.userId },
      })

      let updatedWallet
      if (!wallet) {
        // สร้าง wallet ใหม่ถ้ายังไม่มี
        const newWallet = await prisma.wallet.create({
          data: {
            userId: deposit.userId,
            balance: 0,
          },
        })

        const [walletResult] = await prisma.$transaction([
          prisma.wallet.update({
            where: { id: newWallet.id },
            data: {
              balance: {
                increment: deposit.amount * deposit.rate,
              },
            },
          }),
          prisma.transaction.create({
            data: {
              amount: deposit.amount * deposit.rate,
              type: 'DEPOSIT',
              status: 'COMPLETED',
              slipImage: deposit.slipImage,
              userId: deposit.userId,
              walletId: newWallet.id,
              depositId: deposit.id,
            },
          }),
        ])
        updatedWallet = walletResult
      } else {
        const [walletResult] = await prisma.$transaction([
          prisma.wallet.update({
            where: { id: wallet.id },
            data: {
              balance: {
                increment: deposit.amount * deposit.rate,
              },
            },
          }),
          prisma.transaction.create({
            data: {
              amount: deposit.amount * deposit.rate,
              type: 'DEPOSIT',
              status: 'COMPLETED',
              slipImage: deposit.slipImage,
              userId: deposit.userId,
              walletId: wallet.id,
              depositId: deposit.id,
            },
          }),
        ])
        updatedWallet = walletResult
      }

      // ส่ง email แจ้งเตือน
      if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
        const { sendEmail, EmailTemplates } = await import('@/lib/email')
        const template = EmailTemplates.depositApproved(
          deposit.user.username,
          deposit.amount * deposit.rate,
          updatedWallet.balance
        )
        await sendEmail({
          to: deposit.user.email,
          ...template,
        })
        console.log('✅ Deposit approved email sent to:', deposit.user.email)
      }
    } else if (status === 'REJECTED') {
      // สร้าง transaction failed
      const wallet = await prisma.wallet.findUnique({
        where: { userId: deposit.userId },
      })

      if (wallet) {
        await prisma.transaction.create({
          data: {
            amount: deposit.amount,
            type: 'DEPOSIT',
            status: 'FAILED',
            slipImage: deposit.slipImage,
            userId: deposit.userId,
            walletId: wallet.id,
            depositId: deposit.id,
          },
        })
      }

      // ส่ง email แจ้งเตือนการปฏิเสธ
      if (process.env.GMAIL_USER && process.env.GMAIL_PASSWORD) {
        const { sendEmail, EmailTemplates } = await import('@/lib/email')
        const template = EmailTemplates.depositRejected(
          deposit.user.username,
          deposit.amount,
          comment
        )
        await sendEmail({
          to: deposit.user.email,
          ...template,
        })
        console.log('✅ Deposit rejected email sent to:', deposit.user.email)
      }
    }

    return NextResponse.json(updatedDeposit)
  } catch (error) {
    console.error('Error updating deposit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

