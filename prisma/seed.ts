import { PrismaClient, ItemRarity } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // สร้างผู้ใช้ Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      accountNumber: 'ACC000001',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      role: 'ADMIN',
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // สร้าง wallet สำหรับ admin
  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      balance: 10000,
    },
  })
  console.log('✅ Created admin wallet')

  // สร้างผู้ใช้ NORMAL
  const normalPassword = await bcrypt.hash('user123', 10)
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'normaluser',
      password: normalPassword,
      accountNumber: 'ACC000002',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      role: 'NORMAL',
    },
  })
  console.log('✅ Created normal user:', normalUser.email)

  // สร้าง wallet สำหรับ normal user
  const normalWallet = await prisma.wallet.upsert({
    where: { userId: normalUser.id },
    update: {},
    create: {
      userId: normalUser.id,
      balance: 5000,
    },
  })
  console.log('✅ Created normal user wallet')

  // สร้างผู้ใช้ PREMIUM
  const premiumPassword = await bcrypt.hash('premium123', 10)
  const premiumUser = await prisma.user.upsert({
    where: { email: 'premium@example.com' },
    update: {},
    create: {
      email: 'premium@example.com',
      username: 'premiumuser',
      password: premiumPassword,
      accountNumber: 'ACC000003',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=premium',
      role: 'PREMIUM',
    },
  })
  console.log('✅ Created premium user:', premiumUser.email)

  // สร้าง wallet สำหรับ premium user
  const premiumWallet = await prisma.wallet.upsert({
    where: { userId: premiumUser.id },
    update: {},
    create: {
      userId: premiumUser.id,
      balance: 8000,
    },
  })
  console.log('✅ Created premium user wallet')

  // สร้าง Deposit Rate ตัวอย่าง
  const existingRate = await prisma.depositRate.findFirst({
    where: { name: 'Standard Rate' },
  })
  
  if (!existingRate) {
    await prisma.depositRate.create({
      data: {
        name: 'Standard Rate',
        rate: 1.0,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
      },
    })
  }
  console.log('✅ Created deposit rate')

  // สร้าง Items ตัวอย่าง
  const items: Array<{
    name: string
    description: string
    price: number
    imageUrl: string
    category: string
    rarity: ItemRarity
  }> = [
    {
      name: 'Bronze Sword',
      description: 'A basic sword for beginners',
      price: 500,
      imageUrl: 'https://via.placeholder.com/150/8B4513/FFFFFF?text=Bronze+Sword',
      category: 'Weapon',
      rarity: ItemRarity.COMMON,
    },
    {
      name: 'Silver Shield',
      description: 'A sturdy shield for protection',
      price: 1000,
      imageUrl: 'https://via.placeholder.com/150/C0C0C0/000000?text=Silver+Shield',
      category: 'Armor',
      rarity: ItemRarity.RARE,
    },
    {
      name: 'Golden Helmet',
      description: 'A shiny helmet for the brave',
      price: 2500,
      imageUrl: 'https://via.placeholder.com/150/FFD700/000000?text=Golden+Helmet',
      category: 'Armor',
      rarity: ItemRarity.EPIC,
    },
    {
      name: 'Dragon Blade',
      description: 'A legendary sword forged by dragons',
      price: 10000,
      imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Dragon+Blade',
      category: 'Weapon',
      rarity: ItemRarity.LEGENDARY,
    },
  ]

  for (const itemData of items) {
    await prisma.item.create({
      data: itemData,
    })
  }
  console.log('✅ Created sample items')

  // สร้าง Deposit ตัวอย่าง
  const deposit1 = await prisma.deposit.create({
    data: {
      amount: 5000,
      slipImage: 'https://via.placeholder.com/300/0ea5e9/FFFFFF?text=Slip+5000',
      status: 'APPROVED',
      rate: 1.0,
      userId: normalUser.id,
    },
  })
  console.log('✅ Created sample deposit (approved)')

  // สร้าง Deposit ที่รออนุมัติ
  await prisma.deposit.create({
    data: {
      amount: 2000,
      slipImage: 'https://via.placeholder.com/300/0ea5e9/FFFFFF?text=Slip+2000',
      status: 'PENDING',
      rate: 1.0,
      userId: premiumUser.id,
    },
  })
  console.log('✅ Created pending deposit')

  // สร้าง Withdrawal ที่รออนุมัติ
  await prisma.withdrawal.create({
    data: {
      amount: 1000,
      status: 'PENDING',
      userId: premiumUser.id,
    },
  })
  console.log('✅ Created pending withdrawal')

  // สร้าง Transaction สำหรับ deposit ที่ approved
  await prisma.transaction.create({
    data: {
      amount: 5000,
      type: 'DEPOSIT',
      status: 'COMPLETED',
      slipImage: deposit1.slipImage,
      userId: normalUser.id,
      walletId: normalWallet.id,
      depositId: deposit1.id,
    },
  })
  console.log('✅ Created transaction for deposit')

  // ซื้อไอเทมตัวอย่าง
  const bronzeSword = await prisma.item.findFirst({
    where: { name: 'Bronze Sword' },
  })

  if (bronzeSword) {
    // สร้าง OwnedItem
    const ownedItem = await prisma.ownedItem.create({
      data: {
        userId: normalUser.id,
        itemId: bronzeSword.id,
        isGifted: false,
      },
    })

    // สร้าง Purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId: normalUser.id,
        ownedItemId: ownedItem.id,
      },
    })

    // สร้าง Transaction สำหรับ purchase
    await prisma.transaction.create({
      data: {
        amount: bronzeSword.price,
        type: 'PURCHASE',
        status: 'COMPLETED',
        userId: normalUser.id,
        walletId: normalWallet.id,
        purchaseId: purchase.id,
      },
    })

    // อัปเดตยอดเงินใน wallet หลังซื้อ
    await prisma.wallet.update({
      where: { userId: normalUser.id },
      data: {
        balance: {
          decrement: bronzeSword.price,
        },
      },
    })

    console.log('✅ Created sample purchase')
  }

  // สร้าง LoginHistory ตัวอย่าง
  await prisma.loginHistory.createMany({
    data: [
      {
        userId: admin.id,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        success: true,
      },
      {
        userId: normalUser.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        success: true,
      },
      {
        userId: normalUser.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        success: false,
        failReason: 'รหัสผ่านไม่ถูกต้อง',
      },
    ],
  })
  console.log('✅ Created sample login history')

  // สร้าง ActivityLog ตัวอย่าง
  await prisma.activityLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'LOGIN',
        model: 'User',
        description: 'Admin เข้าสู่ระบบ',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        userId: admin.id,
        action: 'APPROVE',
        model: 'Deposit',
        modelId: deposit1.id,
        description: `อนุมัติคำขอฝากเงิน ${deposit1.amount} บาท`,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        userId: normalUser.id,
        action: 'CREATE',
        model: 'Purchase',
        description: 'ซื้อไอเทม Bronze Sword',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    ],
  })
  console.log('✅ Created sample activity logs')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('┌─────────────────────────────────────────────────┐')
  console.log('│ Admin                                           │')
  console.log('│ Email: admin@example.com                        │')
  console.log('│ Password: admin123                              │')
  console.log('│ Wallet: 10,000 บาท                             │')
  console.log('├─────────────────────────────────────────────────┤')
  console.log('│ Normal User                                     │')
  console.log('│ Email: user@example.com                         │')
  console.log('│ Password: user123                               │')
  console.log('│ Wallet: 4,500 บาท (หลังซื้อไอเทม)              │')
  console.log('├─────────────────────────────────────────────────┤')
  console.log('│ Premium User                                    │')
  console.log('│ Email: premium@example.com                      │')
  console.log('│ Password: premium123                            │')
  console.log('│ Wallet: 8,000 บาท                              │')
  console.log('└─────────────────────────────────────────────────┘')
  console.log('\n📊 Sample Data Created:')
  console.log('✓ 3 Users (Admin, Normal, Premium)')
  console.log('✓ 3 Wallets')
  console.log('✓ 4 Items (Weapons & Armor)')
  console.log('✓ 2 Deposits (1 Approved, 1 Pending)')
  console.log('✓ 1 Withdrawal (Pending)')
  console.log('✓ 2 Transactions')
  console.log('✓ 1 Purchase (Bronze Sword)')
  console.log('✓ 3 Login History')
  console.log('✓ 3 Activity Logs')
  console.log('✓ 1 Deposit Rate\n')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
