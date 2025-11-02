'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/Card'

interface Stats {
  totalUsers: number
  totalTransactions: number
  totalDeposits: number
  totalWithdrawals: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">กำลังโหลด...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">แดชบอร์ดแอดมิน</h1>
        {/* ปุ่มทดสอบ Email อยู่ตรงนี้ */}
        {/* <EmailTestButton variant="primary" /> */}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="ผู้ใช้ทั้งหมด"
          value={stats?.totalUsers || 0}
          icon="👥"
          color="blue-600"
        />
        <Card
          title="ธุรกรรมทั้งหมด"
          value={stats?.totalTransactions || 0}
          icon="📊"
          color="purple-600"
        />
        <Card
          title="เติมเครดิตรวม"
          value={`${(stats?.totalDeposits || 0).toLocaleString()} บาท`}
          icon="💰"
          color="green-600"
        />
        <Card
          title="ใช้เครดิตรวม"
          value={`${(stats?.totalWithdrawals || 0).toLocaleString()} บาท`}
          icon="💸"
          color="red-600"
        />
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">ภาพรวมระบบ</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">จำนวนผู้ใช้งาน:</span>
            <span className="font-medium">{stats?.totalUsers} คน</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">จำนวนธุรกรรม:</span>
            <span className="font-medium">{stats?.totalTransactions} รายการ</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">ยอดเติมเครดิตรวม:</span>
            <span className="font-bold text-green-600">{(stats?.totalDeposits || 0).toLocaleString()} บาท</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">ยอดใช้เครดิตรวม:</span>
            <span className="font-bold text-red-600">{(stats?.totalWithdrawals || 0).toLocaleString()} บาท</span>
          </div>
        </div>
      </div>

      {/* Tips สำหรับ Admin */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Tips สำหรับ Admin</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• คลิกปุ่ม &quot;📧 ทดสอบ Email&quot; เพื่อทดสอบการส่ง email ทุก template</li>
          <li>• ตรวจสอบ Pending deposits/withdrawals ที่ต้องอนุมัติ</li>
          <li>• ดู Activity Logs เพื่อตรวจสอบการทำงานของระบบ</li>
          <li>• ตรวจสอบ Login History หากสงสัยการเข้าถึงผิดปกติ</li>
        </ul>
      </div>
    </div>
  )
}
