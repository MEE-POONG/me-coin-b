'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/Card'

interface User {
  id: string
  name: string
  email: string
  balance: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">แดชบอร์ด</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card
          title="ยอดเครดิตคงเหลือ"
          value={`${user?.balance.toLocaleString() || 0} บาท`}
          icon="💰"
          color="green-600"
        />
        <Card
          title="ชื่อผู้ใช้"
          value={user?.name || '-'}
          icon="👤"
          color="blue-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">ข้อมูลบัญชี</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">อีเมล:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">ชื่อ:</span>
            <span className="font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">ยอดเครดิต:</span>
            <span className="font-bold text-green-600">{user?.balance.toLocaleString()} บาท</span>
          </div>
        </div>
      </div>
    </div>
  )
}

