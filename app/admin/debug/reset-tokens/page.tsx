'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ResetToken {
  id: string
  userId: string
  tokenHash: string
  expiresAt: string
  usedAt: string | null
  createdAt: string
  user: {
    username: string
    email: string
  } | null
  isExpired: boolean
  isUsed: boolean
  isValid: boolean
  status: string
}

interface Stats {
  total: number
  valid: number
  expired: number
  used: number
}

export default function ResetTokensDebugPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tokens, setTokens] = useState<ResetToken[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchTokens()
    }
  }, [session])

  const fetchTokens = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/debug/reset-tokens')
      const data = await res.json()

      if (data.success) {
        setTokens(data.tokens)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = async () => {
    if (!confirm('คุณต้องการลบ tokens ที่หมดอายุและใช้แล้วหรือไม่?')) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/admin/debug/reset-tokens', {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
        fetchTokens()
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('❌ ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting tokens:', error)
      setMessage('❌ เกิดข้อผิดพลาด')
    } finally {
      setDeleting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🔍 Debug: Reset Password Tokens
              </h1>
              <p className="text-gray-600">ตรวจสอบและจัดการ Reset Password Tokens</p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← กลับ Admin
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-gray-600">รวมทั้งหมด</div>
            </div>
            <div className="bg-green-100 rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-green-700">{stats.valid}</div>
              <div className="text-gray-600">ใช้งานได้</div>
            </div>
            <div className="bg-yellow-100 rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-yellow-700">{stats.expired}</div>
              <div className="text-gray-600">หมดอายุ</div>
            </div>
            <div className="bg-gray-100 rounded-lg shadow-md p-6">
              <div className="text-3xl font-bold text-gray-700">{stats.used}</div>
              <div className="text-gray-600">ใช้แล้ว</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={fetchTokens}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              🔄 รีเฟรช
            </button>
            <button
              onClick={handleCleanup}
              disabled={deleting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'กำลังลบ...' : '🗑️ ลบ Tokens ที่หมดอายุ'}
            </button>
          </div>
        </div>

        {/* Tokens Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Token Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    สร้างเมื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    หมดอายุ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ใช้เมื่อ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tokens.map((token) => (
                  <tr key={token.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {token.user?.username || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {token.user?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {token.tokenHash.substring(0, 16)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          token.isValid
                            ? 'bg-green-100 text-green-800'
                            : token.isUsed
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {token.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(token.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(token.expiresAt).toLocaleString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {token.usedAt ? new Date(token.usedAt).toLocaleString('th-TH') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tokens.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              ไม่พบ Reset Tokens
            </div>
          )}
        </div>

        {/* Information */}
        <div className="mt-6 bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">ℹ️ ข้อมูล</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Token จะหมดอายุภายใน 1 ชั่วโมงหลังจากสร้าง</li>
            <li>• Token สามารถใช้งานได้เพียง 1 ครั้งเท่านั้น</li>
            <li>• ระบบจะแสดง 20 tokens ล่าสุด</li>
            <li>• ควรลบ tokens ที่หมดอายุเป็นประจำเพื่อประสิทธิภาพของฐานข้อมูล</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
