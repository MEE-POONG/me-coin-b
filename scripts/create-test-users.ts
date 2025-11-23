import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('👥 Creating test users...\n')

  // สร้าง Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      accountNumber: 'ACC-ADMIN-001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      role: 'ADMIN',
    },
  })
  console.log('✅ Created Admin:', admin.email)

  // สร้าง wallet สำหรับ admin
  await prisma.wallet.create({
    data: {
      userId: admin.id,
      balance: 10000,
    },
  })
  console.log('   Wallet: 10,000 บาท\n')

  // สร้าง Normal User
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      username: 'normaluser',
      password: userPassword,
      accountNumber: 'ACC-USER-001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      role: 'NORMAL',
    },
  })
  console.log('✅ Created Normal User:', user.email)

  await prisma.wallet.create({
    data: {
      userId: user.id,
      balance: 5000,
    },
  })
  console.log('   Wallet: 5,000 บาท\n')

  // สร้าง Premium User
  const premiumPassword = await bcrypt.hash('premium123', 10)
  const premium = await prisma.user.create({
    data: {
      email: 'premium@example.com',
      username: 'premiumuser',
      password: premiumPassword,
      accountNumber: 'ACC-PREMIUM-001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=premium',
      role: 'PREMIUM',
    },
  })
  console.log('✅ Created Premium User:', premium.email)

  await prisma.wallet.create({
    data: {
      userId: premium.id,
      balance: 8000,
    },
  })
  console.log('   Wallet: 8,000 บาท\n')

  // รีเซ็ตรหัสผ่านของ user ที่มีอยู่แล้ว
  const existingPassword = await bcrypt.hash('devilzeros123', 10)
  const updated = await prisma.user.updateMany({
    where: { email: 'devilzeros00@gmail.com' },
    data: { password: existingPassword },
  })
  
  if (updated.count > 0) {
    console.log('✅ Reset password for: devilzeros00@gmail.com')
    console.log('   New password: devilzeros123\n')
  }

  console.log('🎉 All test users created successfully!\n')
  console.log('📋 Test Accounts:')
  console.log('┌─────────────────────────────────────────────────┐')
  console.log('│ Admin:                                          │')
  console.log('│   Email: admin@example.com                      │')
  console.log('│   Password: admin123                            │')
  console.log('├─────────────────────────────────────────────────┤')
  console.log('│ Normal User:                                    │')
  console.log('│   Email: user@example.com                       │')
  console.log('│   Password: user123                             │')
  console.log('├─────────────────────────────────────────────────┤')
  console.log('│ Premium User:                                   │')
  console.log('│   Email: premium@example.com                    │')
  console.log('│   Password: premium123                          │')
  console.log('├─────────────────────────────────────────────────┤')
  console.log('│ Your Account:                                   │')
  console.log('│   Email: devilzeros00@gmail.com                 │')
  console.log('│   Password: devilzeros123                       │')
  console.log('└─────────────────────────────────────────────────┘\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

