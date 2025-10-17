'use client'

import { SessionProvider } from 'next-auth/react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const userMenuItems = [
  { href: '/dashboard', label: 'แดชบอร์ด', icon: '📊' },
  { href: '/dashboard/topup', label: 'เติมเครดิต', icon: '💳' },
  { href: '/dashboard/use', label: 'ใช้เครดิต', icon: '💸' },
  { href: '/dashboard/history', label: 'ประวัติการใช้งาน', icon: '📜' },
]

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar items={userMenuItems} />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}

