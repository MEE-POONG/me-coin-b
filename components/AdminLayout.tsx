'use client'

import { SessionProvider } from 'next-auth/react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const adminMenuItems = [
  { href: '/admin', label: 'แดชบอร์ด', icon: '📊' },
  { href: '/admin/users', label: 'จัดการผู้ใช้', icon: '👥' },
  { href: '/admin/transactions', label: 'ประวัติทั้งหมด', icon: '📜' },
  { href: '/test-email', label: 'ทดสอบ Email', icon: '📧' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar items={adminMenuItems} />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}

