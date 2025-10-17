# 🌱 Seed Data Information - MeCoins

## บัญชีทดสอบทั้งหมด

### 👨‍💼 Admin Account
```
Email: admin@example.com
Password: admin123
Role: ADMIN
Account Number: ACC000001
Wallet Balance: 10,000 บาท
```

**สิทธิ์:**
- ✅ อนุมัติ/ปฏิเสธ Deposit & Withdrawal
- ✅ จัดการ Items (สร้าง/แก้ไข/ลบ)
- ✅ จัดการ Users
- ✅ ดูสถิติทั้งหมด
- ✅ ดู Activity Logs ทั้งหมด
- ✅ ปรับยอดเงิน Wallet

---

### 👤 Normal User Account
```
Email: user@example.com
Password: user123
Role: NORMAL
Account Number: ACC000002
Wallet Balance: 4,500 บาท (หลังซื้อไอเทม)
```

**สิทธิ์:**
- ✅ ฝาก/ถอนเงิน
- ✅ ซื้อไอเทม
- ✅ ส่งของขวัญ
- ✅ โอนเงิน
- ✅ ดูประวัติของตัวเอง

**Owned Items:**
- Bronze Sword (500 บาท)

---

### 💎 Premium User Account
```
Email: premium@example.com
Password: premium123
Role: PREMIUM
Account Number: ACC000003
Wallet Balance: 8,000 บาท
```

**สิทธิ์:**
- ✅ ฝาก/ถอนเงิน
- ✅ ซื้อไอเทม
- ✅ ส่งของขวัญ
- ✅ โอนเงิน
- ✅ ดูประวัติของตัวเอง
- ✨ (Features พิเศษสำหรับ Premium ในอนาคต)

---

## 📦 ข้อมูลตัวอย่างที่สร้าง

### 🛍️ Items (4 รายการ)

| Name | Price | Category | Rarity |
|------|-------|----------|--------|
| Bronze Sword | 500 บาท | Weapon | COMMON |
| Silver Shield | 1,000 บาท | Armor | RARE |
| Golden Helmet | 2,500 บาท | Armor | EPIC |
| Dragon Blade | 10,000 บาท | Weapon | LEGENDARY |

---

### 💵 Deposits

**1. Approved Deposit**
- User: user@example.com
- Amount: 5,000 บาท
- Status: APPROVED ✅
- มี Transaction แล้ว

**2. Pending Deposit**
- User: premium@example.com
- Amount: 2,000 บาท
- Status: PENDING ⏳
- รอ Admin อนุมัติ

---

### 💸 Withdrawals

**1. Pending Withdrawal**
- User: premium@example.com
- Amount: 1,000 บาท
- Status: PENDING ⏳
- รอ Admin อนุมัติ

---

### 🛒 Purchases

**1. Bronze Sword**
- User: user@example.com
- Item: Bronze Sword
- Price: 500 บาท
- Status: COMPLETED ✅

---

### 📊 Transactions (2 รายการ)

1. **DEPOSIT** - 5,000 บาท (COMPLETED)
   - User: user@example.com
   - Type: Deposit Approval

2. **PURCHASE** - 500 บาท (COMPLETED)
   - User: user@example.com
   - Type: Item Purchase (Bronze Sword)

---

### 🔐 Login History (3 รายการ)

1. Admin login - Success ✅
2. Normal User login - Success ✅
3. Normal User login - Failed ❌ (รหัสผ่านไม่ถูกต้อง)

---

### 📝 Activity Logs (3 รายการ)

1. **LOGIN** - Admin เข้าสู่ระบบ
2. **APPROVE** - Admin อนุมัติคำขอฝากเงิน 5,000 บาท
3. **CREATE** - User ซื้อไอเทม Bronze Sword

---

### 💎 Deposit Rates (1 รายการ)

**Standard Rate**
- Rate: 1.0 (1:1)
- Period: 2024-01-01 to 2025-12-31
- Status: Active ✅

---

## 🚀 วิธีใช้งาน Seed

### การรัน Seed
```bash
# รัน seed data
npx prisma db seed

# Reset database แล้ว seed ใหม่
npx prisma db push --force-reset
npx prisma db seed
```

### ตรวจสอบข้อมูล
```bash
# เปิด Prisma Studio
npx prisma studio

# ดูข้อมูลใน MongoDB Compass
# หรือใช้ mongo shell
```

---

## 🎯 Scenarios ที่ทดสอบได้

### สำหรับ Admin
1. ✅ Login ด้วย admin@example.com
2. ✅ ดู Dashboard (สถิติทั้งหมด)
3. ✅ อนุมัติ Deposit ที่รอ (premium user, 2,000 บาท)
4. ✅ อนุมัติ Withdrawal ที่รอ (premium user, 1,000 บาท)
5. ✅ สร้างไอเทมใหม่
6. ✅ แก้ไข/ลบไอเทม
7. ✅ ดู Activity Logs ทั้งหมด
8. ✅ จัดการ Users
9. ✅ ปรับยอดเงิน Wallet

### สำหรับ Normal User
1. ✅ Login ด้วย user@example.com
2. ✅ ดู Wallet (4,500 บาท)
3. ✅ ดูไอเทมที่เป็นเจ้าของ (Bronze Sword)
4. ✅ ฝากเงินใหม่
5. ✅ ซื้อไอเทมเพิ่ม (Silver Shield - 1,000 บาท)
6. ✅ โอนเงินให้ premium user
7. ✅ ส่งไอเทมเป็นของขวัญ
8. ✅ ดูประวัติการใช้งาน

### สำหรับ Premium User
1. ✅ Login ด้วย premium@example.com
2. ✅ ดู Wallet (8,000 บาท)
3. ✅ ตรวจสอบ Deposit ที่รออนุมัติ
4. ✅ ตรวจสอบ Withdrawal ที่รออนุมัติ
5. ✅ ซื้อไอเทม
6. ✅ รับเงินโอนจาก user
7. ✅ รับของขวัญจาก user

---

## 📊 สถิติหลัง Seed

```
Users: 3 (1 Admin, 1 Normal, 1 Premium)
Wallets: 3 (Total Balance: 22,500 บาท)
Items: 4
Deposits: 2 (1 Approved, 1 Pending)
Withdrawals: 1 (Pending)
Transactions: 2
Purchases: 1
Login History: 3
Activity Logs: 3
```

---

## 🔄 Reset และ Seed ใหม่

```bash
# วิธีที่ 1: Force reset
npx prisma db push --force-reset
npx prisma db seed

# วิธีที่ 2: Drop collection ใน MongoDB
# แล้วรัน
npx prisma db push
npx prisma db seed
```

---

## 💡 Tips

1. **ทดสอบ Admin Workflow:**
   - Login → ดู Pending → อนุมัติ → ตรวจสอบ Transaction

2. **ทดสอบ User Workflow:**
   - Login → ดูยอด → ฝาก/ซื้อ → ดูประวัติ

3. **ทดสอบ Payment Flow:**
   - User ฝาก → Admin อนุมัติ → User ซื้อไอเทม

4. **ทดสอบ Gift/Transfer:**
   - User A ซื้อไอเทม → ส่งของขวัญให้ User B
   - User A โอนเงิน → User B รับเงิน

5. **ตรวจสอบ Activity Logs:**
   - ทุกการกระทำควรมี log บันทึก
   - ตรวจสอบ IP และ User Agent

---

## 🎨 Customization

ถ้าต้องการเพิ่มข้อมูลตัวอย่าง แก้ไขที่ `prisma/seed.ts`:

```typescript
// เพิ่ม user
const newUser = await prisma.user.create({...})

// เพิ่ม item
await prisma.item.create({...})

// เพิ่มข้อมูลอื่นๆ
```

แล้วรัน:
```bash
npx prisma db seed
```

---

**ข้อมูล seed พร้อมใช้สำหรับทดสอบระบบทุกส่วน! 🎉**

