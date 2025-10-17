import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-2xl font-bold text-primary-600">💰 MeCoins</div>
            <Link
              href="/login"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            ยินดีต้อนรับสู่ <span className="text-primary-600">MeCoins</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            ระบบจัดการเครดิตออนไลน์ที่ทันสมัยและปลอดภัย
          </p>
          <Link
            href="/login"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold py-4 px-12 rounded-lg transition shadow-lg"
          >
            เริ่มใช้งานเลย
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">เติมเครดิตง่าย</h3>
            <p className="text-gray-600">
              เติมเครดิตได้ทันที ระบบทำงานรวดเร็ว ปลอดภัย
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">ตรวจสอบประวัติ</h3>
            <p className="text-gray-600">
              ดูประวัติการใช้งานทั้งหมด ตรวจสอบยอดเงินได้ตลอดเวลา
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">ปลอดภัยสูง</h3>
            <p className="text-gray-600">
              ระบบรักษาความปลอดภัยระดับสูง ข้อมูลของคุณได้รับการคุ้มครอง
            </p>
          </div>
        </div>

        <div className="mt-20 bg-white rounded-xl shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            คุณสมบัติของระบบ
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">ใช้งานง่าย</h4>
                <p className="text-gray-600">UI/UX ที่ออกแบบมาให้ใช้งานง่าย เข้าใจง่าย</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">รายงานแบบเรียลไทม์</h4>
                <p className="text-gray-600">ข้อมูลอัพเดทแบบทันทีที่มีการเปลี่ยนแปลง</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">แยกสิทธิ์การใช้งาน</h4>
                <p className="text-gray-600">แอดมินและลูกค้ามีหน้าจัดการแยกกันชัดเจน</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">ประวัติการทำธุรกรรม</h4>
                <p className="text-gray-600">บันทึกประวัติทุกการทำธุรกรรมอย่างละเอียด</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 MeCoins. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

