'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (newPassword.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">ลิงก์ไม่ถูกต้อง</h1>
              <p className="text-gray-600">ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว</p>
            </div>
            <Link
              href="/forgot-password"
              className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition text-center"
            >
              ขอลิงก์ใหม่
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">เปลี่ยนรหัสผ่านสำเร็จ</h1>
              <p className="text-gray-600 mb-6">
                รหัสผ่านของคุณได้ถูกเปลี่ยนเรียบร้อยแล้ว<br />
                กำลังพาคุณไปหน้าเข้าสู่ระบบ...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔑</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ตั้งรหัสผ่านใหม่</h1>
            <p className="text-gray-600">กรุณากรอกรหัสผ่านใหม่ของคุณ</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                รหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="กรอกรหัสผ่านใหม่"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
              </p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="showPassword" className="ml-2 text-sm text-gray-700">
                แสดงรหัสผ่าน
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-primary-600 hover:text-primary-700">
                ← กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 text-center">💡 เคล็ดลับการตั้งรหัสผ่าน</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span>✓</span>
                <span>ใช้รหัสผ่านที่มีความยาวอย่างน้อย 8 ตัวอักษร</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✓</span>
                <span>ผสมตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✓</span>
                <span>ห้ามใช้รหัสผ่านที่ง่ายเกินไป เช่น 123456</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
