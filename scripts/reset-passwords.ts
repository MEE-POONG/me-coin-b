import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Resetting passwords for test accounts...\n')

  // Reset Admin password
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.updateMany({
    where: { email: 'admin@example.com' },
    data: { password: adminPassword },
  })
  console.log(`✅ Admin password reset: ${admin.count} user(s) updated`)

  // Reset Normal User password
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.updateMany({
    where: { email: 'user@example.com' },
    data: { password: userPassword },
  })
  console.log(`✅ Normal User password reset: ${user.count} user(s) updated`)

  // Reset Premium User password
  const premiumPassword = await bcrypt.hash('premium123', 10)
  const premium = await prisma.user.updateMany({
    where: { email: 'premium@example.com' },
    data: { password: premiumPassword },
  })
  console.log(`✅ Premium User password reset: ${premium.count} user(s) updated`)

  console.log('\n🎉 All passwords reset successfully!\n')
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
  console.log('└─────────────────────────────────────────────────┘\n')
}

main()
  .catch((e) => {
    console.error('❌ Error resetting passwords:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

