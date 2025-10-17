'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'search' | 'reset'>('search')
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [foundUser, setFoundUser] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })

      const data = await res.json()

      if (res.ok) {
        setFoundUser(data.user)
        setStep('reset')
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    if (newPassword.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: foundUser.id,
          newPassword,
          confirmPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่')
        router.push('/login')
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ลืมรหัสผ่าน</h1>
            <p className="text-gray-600">
              {step === 'search' 
                ? 'ค้นหาบัญชีของคุณเพื่อรีเซ็ตรหัสผ่าน'
                : 'ตั้งรหัสผ่านใหม่'
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {step === 'search' ? (
            // ขั้นตอนที่ 1: ค้นหา User
            <form onSubmit={handleSearch}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  ค้นหาด้วย Discord ID, Username หรือ Email
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="กรอก Discord ID, Username หรือ Email"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  ตัวอย่าง: user@example.com หรือ username หรือ discord123
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'กำลังค้นหา...' : 'ค้นหาบัญชี'}
              </button>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-primary-600 hover:text-primary-700">
                  ← กลับไปหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </form>
          ) : (
            // ขั้นตอนที่ 2: ตั้งรหัสผ่านใหม่
            <>
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
                <p className="font-semibold">✅ พบบัญชีของคุณ</p>
                <p className="text-sm mt-1">Username: {foundUser?.username}</p>
                <p className="text-sm">Email: {foundUser?.email}</p>
              </div>

              <form onSubmit={handleResetPassword}>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    รหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="กรอกรหัสผ่านใหม่"
                    required
                    minLength={6}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    required
                    minLength={6}
                  />
                </div>

                <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>หมายเหตุ:</strong> รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('search')
                      setFoundUser(null)
                      setNewPassword('')
                      setConfirmPassword('')
                      setError('')
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่'}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 text-center">
              💡 วิธีค้นหาบัญชี
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span>✓</span>
                <span><strong>Email:</strong> ใช้อีเมลที่สมัครไว้ เช่น user@example.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>✓</span>
                <span><strong>Username:</strong> ใช้ชื่อผู้ใช้ เช่น normaluser</span>
              </div>
              <div className="flex items-start space-x-2">
                <span>✓</span>
                <span><strong>Discord ID:</strong> ใช้ Discord ID ที่เชื่อมต่อไว้</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

