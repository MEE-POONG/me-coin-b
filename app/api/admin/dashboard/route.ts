import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ดึงสถิติทั้งหมดพร้อมกัน
    const [
      totalUsers,
      totalTransactions,
      pendingDeposits,
      pendingWithdrawals,
      totalDeposits,
      totalWithdrawals,
      totalBalance,
      recentTransactions,
      usersByRole,
    ] = await Promise.all([
      // จำนวนผู้ใช้ทั้งหมด
      prisma.user.count(),
      
      // จำนวน transaction ทั้งหมด
      prisma.transaction.count(),
      
      // คำขอฝากที่รอ
      prisma.deposit.count({ where: { status: 'PENDING' } }),
      
      // คำขอถอนที่รอ
      prisma.withdrawal.count({ where: { status: 'PENDING' } }),
      
      // ยอดเติมเงินทั้งหมด
      prisma.deposit.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
      }),
      
      // ยอดถอนเงินทั้งหมด
      prisma.withdrawal.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
      }),
      
      // ยอดเงินคงเหลือทั้งระบบ
      prisma.wallet.aggregate({
        _sum: { balance: true },
      }),
      
      // Transaction ล่าสุด 10 รายการ
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      
      // จำนวนผู้ใช้แยกตาม Role
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
    ])

    // สถิติวันนี้
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const [todayTransactions, todayUsers, todayDeposits, todayWithdrawals] = await Promise.all([
      prisma.transaction.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      prisma.deposit.aggregate({
        where: {
          createdAt: { gte: today },
          status: 'APPROVED',
        },
        _sum: { amount: true },
      }),
      prisma.withdrawal.aggregate({
        where: {
          createdAt: { gte: today },
          status: 'APPROVED',
        },
        _sum: { amount: true },
      }),
    ])

    return NextResponse.json({
      overview: {
        totalUsers,
        totalTransactions,
        pendingDeposits,
        pendingWithdrawals,
        totalDeposits: totalDeposits._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        totalBalance: totalBalance._sum.balance || 0,
      },
      today: {
        transactions: todayTransactions,
        newUsers: todayUsers,
        deposits: todayDeposits._sum.amount || 0,
        withdrawals: todayWithdrawals._sum.amount || 0,
      },
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count,
      })),
      recentTransactions,
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

