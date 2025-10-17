'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={session?.user?.role === 'ADMIN' ? '/admin' : '/dashboard'} className="text-2xl font-bold text-primary-600">
              💰 MeCoins
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

