'use client'

import { SessionProvider } from 'next-auth/react'
import Sidebar from './Sidebar'
import { useState } from 'react'

// (ถ้าอยากใช้ Link/NavBar ค่อยเพิ่มทีหลัง)
const adminMenuItems = [
  { href: '/admin', label: 'แดชบอร์ด', icon: '📊' },
  { href: '/admin/deposit', label: 'จัดการเติมเครดิต', icon: '💰' },
  { href: '/admin/deposit/history', label: 'ประวัติการเติมเครดิต', icon: '�' },
  { href: '/admin/users', label: 'จัดการผู้ใช้', icon: '👥' },
  { href: '/admin/admins', label: 'จัดการ Admin', icon: '👨‍💼' },
  { href: '/admin/transactions', label: 'ประวัติการทำธุรกรรม', icon: '📜' },
  { href: '/admin/test-email', label: 'ทดสอบ Email', icon: '📧' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true) // จะให้เปิดค่าเริ่มต้นก็ได้

  const onToggle = () => setIsOpen((v) => !v)

  return (
    <SessionProvider>
      <div className="min-h-screen bg-purple-200">
        <div className="flex">
          {/* Sidebar ใช้ slide-in/out แทนการซ่อน width */}
          <Sidebar items={adminMenuItems} isOpen={isOpen} onToggle={onToggle} />

          {/* main ขยับซ้าย/ขวาให้พ้น sidebar เฉพาะตอนเปิด */}
          <main
            className={`flex-1 p-8 transition-all duration-300 ${isOpen ? 'md:ml-64' : 'md:ml-0'
              }`}
          >
            {/* ปุ่มลอยไว้เรียกเปิด sidebar เมื่อปิดอยู่ (มือถือ/จอเล็ก) */}
            {!isOpen && (
              <ButtonSidebar onClick={onToggle} className='fixed left-[-10px] top-3 z-30 rounded-lg rounded-l-none bg-white shadow px-3 py-2 pl-0 text-xl' />
            )}
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}

/* ย้ายปุ่มไปให้ Sidebar เรียกใช้ผ่าน props แทนการ export จากไฟล์นี้ */
export function ButtonSidebar({ onClick, className = 'inline-flex items-center justify-center rounded-lg px-2 py-1 text-2xl hover:bg-gray-100' }: { onClick: () => void, className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`${className}`}
      aria-label="Toggle sidebar"
    >
      ↔️
    </button>
  )
}
