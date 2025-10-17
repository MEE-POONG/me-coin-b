import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-9xl font-bold text-primary-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="text-gray-600 mb-8">
          ขอโทษครับ หน้าที่คุณกำลังมองหาอาจถูกย้าย หรือไม่มีอยู่ในระบบ
        </p>
        <Link
          href="/"
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  )
}

