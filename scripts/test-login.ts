import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Testing login credentials...\n')

  const testEmail = 'admin@example.com'
  const testPassword = 'admin123'

  // ค้นหา user
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: testEmail },
        { username: testEmail },
      ],
    },
  })

  if (!user) {
    console.log('❌ User not found!')
    return
  }

  console.log('✅ User found:')
  console.log(`   Email: ${user.email}`)
  console.log(`   Username: ${user.username}`)
  console.log(`   Role: ${user.role}`)
  console.log(`   Created: ${user.createdAt}\n`)

  // ทดสอบ password
  const isPasswordValid = await bcrypt.compare(testPassword, user.password)

  if (isPasswordValid) {
    console.log('✅ Password is CORRECT!')
    console.log(`   You can login with: ${testEmail} / ${testPassword}`)
  } else {
    console.log('❌ Password is INCORRECT!')
    console.log('   The password hash in database does not match.')
  }

  // ตรวจสอบ environment variables
  console.log('\n🔍 Environment Variables:')
  console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'NOT SET'}`)
  console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'SET (' + process.env.NEXTAUTH_SECRET.substring(0, 10) + '...)' : 'NOT SET'}`)
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

