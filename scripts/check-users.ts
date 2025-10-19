import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking users in database...\n')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  })

  console.log(`Found ${users.length} user(s):\n`)
  
  if (users.length === 0) {
    console.log('❌ No users found! Database needs to be seeded.')
  } else {
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.role})`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Created: ${user.createdAt}`)
      console.log('')
    })
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

