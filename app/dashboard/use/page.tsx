'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UseCreditPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'กรุณากรอกจำนวนเงินที่ถูกต้อง' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WITHDRAW',
          amount: parseFloat(amount),
          description: description || 'ใช้เครดิต',
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'ใช้เครดิตสำเร็จ!' })
        setAmount('')
        setDescription('')
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        const error = await res.json()
        if (error.error === 'Insufficient balance') {
          setMessage({ type: 'error', text: 'เครดิตไม่เพียงพอ' })
        } else {
          setMessage({ type: 'error', text: error.error || 'เกิดข้อผิดพลาด' })
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">ใช้เครดิต</h1>

      <div className="max-w-2xl bg-white rounded-lg shadow-md p-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              จำนวนเงิน (บาท) *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="กรอกจำนวนเงินที่ต้องการใช้"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              หมายเหตุ (ถ้ามี)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="ระบุรายละเอียดเพิ่มเติม"
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังดำเนินการ...' : 'ใช้เครดิต'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
            >
              ยกเลิก
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold text-gray-800 mb-3">ตัวอย่างจำนวนเงิน</h3>
          <div className="grid grid-cols-3 gap-3">
            {[50, 100, 200, 500, 1000, 2000].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value.toString())}
                className="py-2 px-4 bg-gray-100 hover:bg-red-100 border border-gray-300 rounded-lg transition"
              >
                {value} บาท
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>หมายเหตุ:</strong> การใช้เครดิตจะทำให้ยอดคงเหลือของคุณลดลง
          </p>
        </div>
      </div>
    </div>
  )
}

