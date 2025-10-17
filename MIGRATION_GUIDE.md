# 🔄 Migration Guide - MeCoins Schema Update

## ภาพรวมการเปลี่ยนแปลง

โปรเจค MeCoins ได้ถูกอัปเดตให้มีระบบที่สมบูรณ์ยิ่งขึ้น โดยเพิ่มฟีเจอร์ใหม่หลายอย่าง:

### ✨ ฟีเจอร์ใหม่

1. **Wallet System** - แยก Wallet ออกจาก User
2. **Item Shop** - ระบบร้านค้าไอเทม
3. **Gift System** - ระบบให้ของขวัญ
4. **Transfer System** - ระบบโอนเงินระหว่างผู้ใช้
5. **Deposit/Withdrawal Approval** - ระบบอนุมัติฝาก/ถอน
6. **Deposit Rates** - อัตราแลกเปลี่ยนการฝาก
7. **User Roles** - เพิ่ม PREMIUM role

---

## 🗂️ การเปลี่ยนแปลง Schema

### User Model
**เปลี่ยนแปลง:**
- ✅ เพิ่ม `discordId` (optional, unique)
- ✅ เปลี่ยน `name` เป็น `username`
- ✅ เพิ่ม `accountNumber` (unique)
- ✅ เพิ่ม `avatar`
- ✅ เพิ่ม role `PREMIUM`
- ❌ ลบ `balance` (ย้ายไป Wallet)
- ✅ เพิ่ม relations: wallet, deposits, withdrawals, purchases, etc.

### Transaction Model
**เปลี่ยนแปลง:**
- ✅ เพิ่ม `status` field
- ✅ เพิ่ม `slipImage`
- ✅ เพิ่ม `walletId` (required)
- ✅ เปลี่ยน `type` enum: เพิ่ม PURCHASE, GIFT, TRANSFER
- ✅ เพิ่ม optional relations: depositId, withdrawalId, purchaseId, giftId, transferId
- ❌ ลบ `description`, `balanceBefore`, `balanceAfter`

### Models ใหม่
- ✅ **Wallet** - จัดการยอดเงิน
- ✅ **Deposit** - คำขอฝากเงิน
- ✅ **Withdrawal** - คำขอถอนเงิน
- ✅ **Item** - ไอเทมในร้านค้า
- ✅ **OwnedItem** - ไอเทมที่ผู้ใช้เป็นเจ้าของ
- ✅ **Purchase** - ประวัติการซื้อ
- ✅ **Gift** - ประวัติการให้ของขวัญ
- ✅ **Transfer** - ประวัติการโอนเงิน
- ✅ **DepositRate** - อัตราแลกเปลี่ยน

---

## 📋 ขั้นตอนการ Migration

### 1. Backup ข้อมูลเดิม

```bash
# Backup database ก่อน migrate
pg_dump -U postgres mecoins > backup_before_migration.sql
```

### 2. อัปเดต Prisma Schema

ไฟล์ `prisma/schema.prisma` ได้ถูกอัปเดตแล้ว

### 3. Generate Prisma Client ใหม่

```bash
npx prisma generate
```

### 4. สร้าง Migration

```bash
# สำหรับ PostgreSQL - reset database (ข้อมูลจะหายทั้งหมด!)
npx prisma db push --force-reset

# หรือถ้าต้องการ migrate แบบมี migration history
npx prisma migrate dev --name add_full_system
```

### 5. Seed ข้อมูลใหม่

```bash
npx prisma db seed
```

---

## 🔄 การ Migrate ข้อมูลเก่า (ถ้ามี)

หากคุณมีข้อมูลเก่าที่ต้องการย้าย ให้ทำตามขั้นตอนนี้:

### สร้าง Migration Script

สร้างไฟล์ `scripts/migrate-data.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateUsers() {
  // ดึง users ทั้งหมดจากตารางเก่า
  const oldUsers = await prisma.$queryRaw`
    SELECT * FROM users_backup
  `
  
  for (const oldUser of oldUsers) {
    // สร้าง user ใหม่
    const newUser = await prisma.user.create({
      data: {
        email: oldUser.email,
        username: oldUser.name || oldUser.email.split('@')[0],
        password: oldUser.password,
        accountNumber: generateAccountNumber(),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + oldUser.id,
        role: oldUser.role === 'ADMIN' ? 'ADMIN' : 'NORMAL',
      },
    })
    
    // สร้าง wallet
    await prisma.wallet.create({
      data: {
        userId: newUser.id,
        balance: oldUser.balance || 0,
      },
    })
  }
}

function generateAccountNumber() {
  return 'ACC' + Date.now().toString().slice(-6)
}

migrateUsers()
  .then(() => console.log('Migration completed'))
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

รัน migration:
```bash
npx ts-node scripts/migrate-data.ts
```

---

## 🆕 API Endpoints ใหม่

### Wallet APIs
- `GET /api/wallet` - ดู wallet
- `POST /api/wallet` - สร้าง wallet

### Deposit APIs
- `GET /api/deposits` - ดูรายการฝาก
- `POST /api/deposits` - สร้างคำขอฝาก
- `PATCH /api/deposits/:id` - อนุมัติ/ปฏิเสธ (Admin)

### Withdrawal APIs
- `GET /api/withdrawals` - ดูรายการถอน
- `POST /api/withdrawals` - สร้างคำขอถอน
- `PATCH /api/withdrawals/:id` - อนุมัติ/ปฏิเสธ (Admin)

### Item APIs
- `GET /api/items` - ดูรายการไอเทม
- `POST /api/items` - สร้างไอเทม (Admin)
- `GET /api/items/:id` - ดูไอเทมเดี่ยว
- `PUT /api/items/:id` - แก้ไขไอเทม (Admin)
- `DELETE /api/items/:id` - ลบไอเทม (Admin)

### Owned Items APIs
- `GET /api/owned-items` - ดูไอเทมของตัวเอง

### Purchase APIs
- `GET /api/purchases` - ดูประวัติการซื้อ
- `POST /api/purchases` - ซื้อไอเทม

### Gift APIs
- `GET /api/gifts` - ดูประวัติของขวัญ
- `POST /api/gifts` - ส่งของขวัญ

### Transfer APIs
- `GET /api/transfers` - ดูประวัติโอนเงิน
- `POST /api/transfers` - โอนเงิน

### Deposit Rate APIs
- `GET /api/deposit-rates` - ดูอัตราแลกเปลี่ยน
- `POST /api/deposit-rates` - สร้างอัตรา (Admin)
- `PUT /api/deposit-rates/:id` - แก้ไขอัตรา (Admin)
- `DELETE /api/deposit-rates/:id` - ลบอัตรา (Admin)

---

## 🔧 การแก้ไข Code ที่มีอยู่

### 1. อัปเดต User Interface

**เก่า:**
```typescript
interface User {
  name: string
  balance: number
}
```

**ใหม่:**
```typescript
interface User {
  username: string
  accountNumber: string
  avatar: string
  wallet?: {
    balance: number
  }
}
```

### 2. อัปเดตการเรียก API

**เก่า:**
```typescript
// ดูยอดเงิน
const balance = user.balance
```

**ใหม่:**
```typescript
// ดูยอดเงิน
const balance = user.wallet?.balance || 0

// หรือเรียก API แยก
const wallet = await fetch('/api/wallet')
const { balance } = await wallet.json()
```

### 3. อัปเดต Transaction การเติม/ถอน

**เก่า:**
```typescript
// เติมเงินโดยตรง
POST /api/transactions
{
  type: 'DEPOSIT',
  amount: 1000
}
```

**ใหม่:**
```typescript
// สร้างคำขอฝาก (รอ Admin อนุมัติ)
POST /api/deposits
{
  amount: 1000,
  slipImage: 'url-to-slip'
}

// Admin อนุมัติ
PATCH /api/deposits/:id
{
  status: 'APPROVED'
}
```

---

## ⚠️ Breaking Changes

### 1. User Model
- `user.name` → `user.username`
- `user.balance` → `user.wallet.balance`

### 2. Transaction Model
- ต้องมี `walletId` เสมอ
- `type` มี enum ใหม่: PURCHASE, GIFT, TRANSFER
- ไม่มี `description` แล้ว

### 3. Authentication
- Session ยังคงใช้ `user.name` ซึ่งจะแมปจาก `username`

---

## ✅ Testing Checklist

หลัง migrate แล้ว ให้ทดสอบ:

- [ ] Login/Logout ทำงานปกติ
- [ ] ดูข้อมูล User profile
- [ ] ดูยอดเงินใน Wallet
- [ ] สร้างคำขอ Deposit
- [ ] Admin อนุมัติ Deposit
- [ ] สร้างคำขอ Withdrawal
- [ ] Admin อนุมัติ Withdrawal
- [ ] ดูรายการ Items
- [ ] ซื้อ Items
- [ ] ดู Owned Items
- [ ] ส่ง Gift
- [ ] โอนเงิน
- [ ] ดูประวัติ Transactions

---

## 🆘 Troubleshooting

### ปัญหา: Migration ไม่สำเร็จ
```bash
# Reset database และ migrate ใหม่
npx prisma migrate reset
npx prisma db push
npx prisma db seed
```

### ปัญหา: TypeScript errors
```bash
# Generate Prisma Client ใหม่
npx prisma generate

# Restart TypeScript server ใน VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### ปัญหา: API returns 404
```bash
# ตรวจสอบว่า Next.js server รันอยู่
npm run dev

# เช็ค routes ที่มี
ls -la app/api/
```

---

## 📚 เอกสารเพิ่มเติม

- [API Documentation](./API_DOCUMENTATION.md)
- [README](./README.md)
- [Setup Guide](./SETUP.md)

---

**หมายเหตุ:** Migration นี้จะทำให้ข้อมูลเก่าหายหมด แนะนำให้ backup ก่อนเสมอ!

