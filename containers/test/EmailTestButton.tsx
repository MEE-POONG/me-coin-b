'use client'

import { useState } from 'react'
import styles from './EmailTestButton.module.scss'

interface EmailTestButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
}

export default function EmailTestButton({ 
  className = '', 
  variant = 'primary' 
}: EmailTestButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [testEmail, setTestEmail] = useState('devilzeros00@gmail.com')
  const [showModal, setShowModal] = useState(false)

  const handleSendTestEmail = async (templateType: string) => {
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/test/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          template: templateType,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult(`✅ ส่งสำเร็จ! Message ID: ${data.messageId}`)
      } else {
        setResult(`❌ ส่งไม่สำเร็จ: ${data.error}`)
      }
    } catch (error) {
      setResult('❌ เกิดข้อผิดพลาด: ไม่สามารถเชื่อมต่อ API ได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`${styles.button} ${styles[`button--${variant}`]} ${className}`}
      >
        📧 ทดสอบส่ง Email
      </button>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">📧 ทดสอบส่ง Email</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>
            </div>

            <div className={styles.modalBody}>
              {/* Input Email */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  ส่งไปที่ Email:
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className={styles.input}
                  placeholder="กรอกอีเมลปลายทาง"
                />
              </div>

              {/* Email Templates */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800 mb-3">เลือก Template ที่ต้องการทดสอบ:</h3>
                
                <button
                  onClick={() => handleSendTestEmail('welcome')}
                  disabled={loading}
                  className={`${styles.templateButton} ${styles['templateButton--purple']}`}
                >
                  <span>🎉 Welcome Email - ต้อนรับสมาชิกใหม่</span>
                  <span className={styles.badge}>Welcome</span>
                </button>

                <button
                  onClick={() => handleSendTestEmail('reset-password')}
                  disabled={loading}
                  className={`${styles.templateButton} ${styles['templateButton--blue']}`}
                >
                  <span>🔐 Reset Password - ลืมรหัสผ่าน</span>
                  <span className={styles.badge}>Password</span>
                </button>

                <button
                  onClick={() => handleSendTestEmail('deposit-approved')}
                  disabled={loading}
                  className={`${styles.templateButton} ${styles['templateButton--green']}`}
                >
                  <span>✅ Deposit Approved - อนุมัติฝากเงิน</span>
                  <span className={styles.badge}>Deposit</span>
                </button>

                <button
                  onClick={() => handleSendTestEmail('deposit-rejected')}
                  disabled={loading}
                  className={`${styles.templateButton} ${styles['templateButton--red']}`}
                >
                  <span>❌ Deposit Rejected - ปฏิเสธฝากเงิน</span>
                  <span className={styles.badge}>Deposit</span>
                </button>

                <button
                  onClick={() => handleSendTestEmail('withdrawal-approved')}
                  disabled={loading}
                  className={`${styles.templateButton} ${styles['templateButton--indigo']}`}
                >
                  <span>✅ Withdrawal Approved - อนุมัติถอนเงิน</span>
                  <span className={styles.badge}>Withdrawal</span>
                </button>

                <button
                  onClick={() => handleSendTestEmail('transaction')}
                  disabled={loading}
                  className={`${styles.templateButton} ${styles['templateButton--yellow']}`}
                >
                  <span>💰 Transaction - แจ้งเตือนธุรกรรม</span>
                  <span className={styles.badge}>Transaction</span>
                </button>
              </div>

              {/* Result */}
              {result && (
                <div className={`${styles.result} ${result.includes('✅') ? styles['result--success'] : styles['result--error']}`}>
                  {result}
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className={styles.loading}>
                  <div className={styles.spinner}></div>
                  <p className="mt-2 text-gray-600">กำลังส่ง email...</p>
                </div>
              )}

              {/* Info */}
              <div className={styles.info}>
                <p className="text-sm text-yellow-800">
                  💡 <strong>หมายเหตุ:</strong> ตรวจสอบ email ที่ <strong>{testEmail}</strong> (Inbox หรือ Spam)
                </p>
              </div>

              {/* Close button */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className={styles.closeBtn}
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
