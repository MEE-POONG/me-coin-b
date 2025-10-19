'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      console.log('result : ', result)
      
      if (result?.ok && !result?.error) {
        // Login สำเร็จ - ดึงข้อมูล session เพื่อเช็คว่าเป็น role อะไร
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        console.log('session : ', session)

        // ใช้ optional chaining และ fallback ไปที่ dashboard
        const userRole = session?.user?.role
        console.log('User role:', userRole)

        if (userRole === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }

        // Force reload to ensure session is properly loaded
        router.refresh()
      } else {
        // Login ไม่สำเร็จ
        setError(result?.error || 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">💰</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">MeCoins</h1>
            <p className="text-gray-600">เข้าสู่ระบบเพื่อจัดการเครดิต</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                อีเมล / Username / Discord ID
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="กรอกอีเมล, Username หรือ Discord ID"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                รหัสผ่าน
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="กรอกรหัสผ่าน"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="mt-6 text-center flex justify-between">
            <Link href="/" className="text-primary-600 hover:text-primary-700 mr-4">
              สมัครสมาชิก
            </Link>
            <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700">
              ลืมรหัสผ่าน
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">บัญชีทดสอบ:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="bg-gray-50 p-3 rounded">
                <strong>Admin:</strong> admin@example.com / admin123
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>User:</strong> user@example.com / user123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

