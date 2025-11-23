'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Step = 'search' | 'selectAccount' | 'sent';
type FoundUser = {
  id: string;
  username: string;
  email: string;
  maskedEmail: string;
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('search');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/search-accout?search=${identifier}`, {
        method: 'GET',
      });
      const data = await res.json();

      setFoundUser(data?.data as FoundUser);
      if (data?.data) {
        setStep('selectAccount');
      } else {
        setError('ไม่พบบัญชีที่ตรงกัน');
        setFoundUser(null);
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMail = async () => {
    if (!foundUser) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: foundUser.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'ส่งอีเมลไม่สำเร็จ');
        return;
      }
      setStep('sent');
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const resetToSearch = () => {
    setStep('search');
    setFoundUser(null);
    setIdentifier('');
    setError('');
  };
  useEffect(() => {
    console.log(`foundUser : `, foundUser);
  }, [foundUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ลืมรหัสผ่าน</h1>
            <p className="text-gray-600">
              {step === 'search' && 'ค้นหาบัญชีของคุณเพื่อรีเซ็ตรหัสผ่าน'}
              {step === 'selectAccount' && 'ยืนยันว่าเป็นบัญชีของคุณ'}
              {step === 'sent' && 'ส่งอีเมลยืนยันการเปลี่ยนรหัสแล้ว'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
          )}

          {step === 'search' && (
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

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3 text-center">💡 วิธีค้นหาบัญชี</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2"><span>✓</span><span><strong>Email:</strong> เช่น user@example.com</span></div>
                  <div className="flex items-start gap-2"><span>✓</span><span><strong>Username:</strong> เช่น normaluser</span></div>
                  <div className="flex items-start gap-2"><span>✓</span><span><strong>Discord ID:</strong> เช่น discord123</span></div>
                </div>
              </div>
            </form>
          )}

          {step === 'selectAccount' && foundUser && (
            <>
              <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg">
                <p className="font-semibold">✅ พบบัญชีของคุณ</p>
                <p className="text-sm mt-1">Username: {foundUser.username}</p>
                <p className="text-sm">Email: {foundUser.email}</p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSendMail}
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังส่งอีเมล...' : 'ส่งอีเมลยืนยันเปลี่ยนรหัส'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={resetToSearch}
                    className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-3 px-4 rounded-lg transition"
                  >
                    ไม่ใช่ (ค้นหาใหม่)
                  </button>
                  <button
                    type="button"
                    onClick={handleSendMail}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50"
                  >
                    ใช่ ส่งลิงก์ให้ฉัน
                  </button>
                </div>

                <p className="text-xs text-gray-500">* ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ</p>
              </div>
            </>
          )}

          {step === 'sent' && foundUser && (
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">ส่งอีเมลยืนยันแล้ว</h2>
              <p className="text-gray-600 mb-6">
                กรุณาตรวจสอบกล่องจดหมายที่ <strong>{foundUser.maskedEmail}</strong><br />
                และคลิกลิงก์เพื่อไปตั้งรหัสผ่านใหม่
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={resetToSearch}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition"
                >
                  ค้นหาบัญชีอื่น
                </button>
                <Link
                  href="/login"
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  ไปหน้าเข้าสู่ระบบ
                </Link>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                เคล็ดลับ: ถ้าไม่พบอีเมล ลองเช็คโฟลเดอร์สแปมหรือโปรโมชัน
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
