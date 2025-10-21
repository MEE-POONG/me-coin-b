'use client'

import EmailTestButton from '@/containers/test/EmailTestButton'
import Link from 'next/link'

export default function TestEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">📧 Email Testing Center</h1>
            <p className="text-blue-100">ทดสอบการส่ง Email ทุก Template</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">ℹ️ ข้อมูลการตั้งค่า</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gmail User:</span>
                  <span className="font-mono text-sm bg-white px-3 py-1 rounded border">
                    {process.env.NEXT_PUBLIC_GMAIL_USER || 'me.prompt.tec@gmail.com'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">SMTP Service:</span>
                  <span className="font-semibold text-blue-600">Gmail SMTP</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🧪 ทดสอบส่ง Email</h2>
              <p className="text-gray-600 mb-4">
                คลิกปุ่มด้านล่างเพื่อทดสอบส่ง email แต่ละแบบ
              </p>
              
              <div className="flex justify-center">
                <EmailTestButton className="text-lg px-8 py-4" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">📝 Email Templates ที่มี:</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ <strong>Welcome Email</strong> - ต้อนรับสมาชิกใหม่</li>
                <li>✓ <strong>Reset Password</strong> - ลืมรหัสผ่าน</li>
                <li>✓ <strong>Deposit Approved</strong> - อนุมัติฝากเงิน</li>
                <li>✓ <strong>Deposit Rejected</strong> - ปฏิเสธฝากเงิน</li>
                <li>✓ <strong>Withdrawal Approved</strong> - อนุมัติถอนเงิน</li>
                <li>✓ <strong>Transaction Notification</strong> - แจ้งเตือนธุรกรรม</li>
              </ul>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>สำคัญ:</strong> ต้องตั้งค่า <code className="bg-yellow-100 px-2 py-1 rounded">GMAIL_USER</code> และ <code className="bg-yellow-100 px-2 py-1 rounded">GMAIL_PASSWORD</code> ใน .env ก่อน
              </p>
              <p className="text-sm text-yellow-800 mt-2">
                💡 อ่านวิธีตั้งค่าได้ที่: <code className="bg-yellow-100 px-2 py-1 rounded">GMAIL_SETUP_STEPS.md</code>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link 
                href="/admin"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← กลับไปหน้าแอดมิน
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Guide */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🚀 Quick Setup Guide</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">1</span>
              <div>
                <strong>เปิด 2-Factor Authentication</strong>
                <p className="text-gray-600">ที่ https://myaccount.google.com/security</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">2</span>
              <div>
                <strong>สร้าง App Password</strong>
                <p className="text-gray-600">ที่ https://myaccount.google.com/apppasswords</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">3</span>
              <div>
                <strong>ใส่ใน .env</strong>
                <div className="bg-gray-800 text-green-400 p-2 rounded mt-1 font-mono text-xs">
                  GMAIL_USER=&quot;me.prompt.tec@gmail.com&quot;<br/>
                  GMAIL_PASSWORD=&quot;your-app-password&quot;
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">4</span>
              <div>
                <strong>Restart Dev Server</strong>
                <p className="text-gray-600">หยุดและรัน <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> ใหม่</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

