'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  items: {
    href: string
    label: string
    icon: string
  }[]
}

export default function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen">
      <nav className="mt-8">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition ${
              pathname === item.href ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600' : ''
            }`}
          >
            <span className="text-2xl mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

