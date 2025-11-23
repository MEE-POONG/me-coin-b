'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ButtonSidebar } from './AdminLayout'

interface SidebarProps {
  items: { href: string; label: string; icon: string }[]
  className?: string
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ items, className = '', isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={[
        // layout & size
        'fixed left-0 top-0 z-40 w-64 h-screen max-h-screen bg-white shadow-lg',
        // column layout + prevent parent from scrolling
        'flex flex-col overflow-hidden',
        // slide in/out
        'transform transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        className,
      ].join(' ')}
    >
      {/* Header (fixed height) */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 flex-none">
        <Link href="/admin" className="mx-auto block text-2xl font-bold text-primary-600">
          💰 MeCoins
        </Link>
        <ButtonSidebar onClick={onToggle} />
      </div>

      {/* Scroll area */}
      <nav className="mt-2 flex-1 overflow-y-auto overscroll-contain">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center px-6 py-2 text-gray-700 transition',
                'hover:bg-primary-50 hover:text-primary-600',
                active ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600' : '',
              ].join(' ')}
            >
              <span className="text-2xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer (fixed height) */}
      <div className="p-4 border-t border-gray-200 flex-none">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
        >
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}
