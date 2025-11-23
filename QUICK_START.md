# 🚀 Quick Start Guide - MeCoins

## เริ่มต้นใช้งานระบบ MeCoins

---

## ✅ Checklist การติดตั้ง

### 1. ติดตั้ง Dependencies
```bash
npm install
```

---

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` และกรอกข้อมูลต่อไปนี้:

```env
# Database (MongoDB)
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/mecoins?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-string-here"

# Email (Gmail SMTP)
EMAIL_USER="me.prompt.tec@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
```

**วิธีสร้าง values:**

**NEXTAUTH_SECRET:**
```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))

# macOS/Linux
openssl rand -base64 32
```

**EMAIL_PASSWORD:**
ดูวิธีสร้าง Gmail App Password ที่ `EMAIL_SETUP_GUIDE.md`

---

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to MongoDB
npx prisma db push

# Seed ข้อมูลตัวอย่าง
npx prisma db seed
```

---

### 4. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่: http://localhost:3000

---

## 🔑 บัญชีทดสอบ

### Admin
```
Email: admin@example.com
Password: admin123
Role: ADMIN
Wallet: 10,000 บาท
```

### Normal User
```
Email: user@example.com
Password: user123
Role: NORMAL
Wallet: 4,500 บาท
```

### Premium User
```
Email: premium@example.com
Password: premium123
Role: PREMIUM
Wallet: 8,000 บาท
```

---

## 🎯 ทดสอบฟีเจอร์

### สำหรับ Admin:

1. **Login**
   ```
   http://localhost:3000/login
   admin@example.com / admin123
   ```

2. **ดู Dashboard**
   ```
   → แสดงสถิติภาพรวม
   → Pending deposits/withdrawals
   → Recent transactions
   ```

3. **อนุมัติ Deposit**
   ```
   /admin/deposits/pending
   → มี 1 รายการรอ (Premium user, 2,000 บาท)
   → คลิก Approve
   → ระบบส่ง email แจ้งเตือน ✅
   ```

4. **อนุมัติ Withdrawal**
   ```
   /admin/withdrawals/pending
   → มี 1 รายการรอ (Premium user, 1,000 บาท)
   → คลิก Approve
   → ระบบส่ง email แจ้งเตือน ✅
   ```

5. **จัดการ Items**
   ```
   → สร้าง/แก้ไข/ลบไอเทม
   → Activity log บันทึกทุกการกระทำ
   ```

---

### สำหรับ User:

1. **Login**
   ```
   user@example.com / user123
   ```

2. **ดู Dashboard**
   ```
   → ยอดเงินคงเหลือ: 4,500 บาท
   → มีไอเทม: Bronze Sword
   ```

3. **เติมเงิน**
   ```
   /dashboard/topup
   → กรอกจำนวน + อัพโหลดสลิป
   → รอ Admin อนุมัติ
   → ได้รับ email เมื่ออนุมัติ ✅
   ```

4. **ซื้อไอเทม**
   ```
   → ดูรายการไอเทม
   → ซื้อ Silver Shield (1,000 บาท)
   → ดูใน Owned Items
   ```

5. **ส่งของขวัญ**
   ```
   → เลือกไอเทมที่เป็นเจ้าของ
   → ส่งให้ premium user
   → ไอเทมโอนไปให้ผู้รับ
   ```

6. **โอนเงิน**
   ```
   → เลือกผู้รับ
   → ระบุจำนวนเงิน
   → ทั้งคู่มี Transaction log
   ```

---

## 📧 ทดสอบการส่ง Email

### วิธีที่ 1: ใช้ Test Script

```bash
npx ts-node scripts/test-email.ts
```

จะส่ง email ทดสอบ 4 แบบไปที่ me.prompt.tec@gmail.com

---

### วิธีที่ 2: ทดสอบผ่านระบบ

1. Login เป็น Premium user
2. สร้างคำขอฝากเงิน
3. Login เป็น Admin
4. อนุมัติคำขอ
5. ตรวจสอบ email ที่ me.prompt.tec@gmail.com (หรือ premium user email)

---

## 🛠️ Commands ที่ใช้บ่อย

```bash
# Development
npm run dev              # รัน dev server
npm run build            # Build production
npm run start            # รัน production server

# Prisma
npx prisma studio        # เปิด Prisma Studio (GUI)
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema to database
npx prisma db seed       # Seed ข้อมูล
npx prisma format        # Format schema file

# Testing
npx ts-node scripts/test-email.ts  # ทดสอบส่ง email

# Database
npx prisma db push --force-reset   # Reset database (ข้อมูลหาย!)
```

---

## 📂 โครงสร้างโปรเจค

```
mecoins/
├── app/
│   ├── api/              # API Routes (35+ endpoints)
│   ├── admin/            # Admin pages
│   ├── dashboard/        # User pages
│   ├── login/            # Login page
│   ├── forgot-password/  # Forgot password page 🆕
│   └── not-found.tsx     # 404 page
├── components/           # React components
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── prisma.ts        # Prisma client
│   ├── email.ts         # Email service 🆕
│   ├── activity-logger.ts  # Activity logging
│   └── get-client-info.ts  # IP & User Agent
├── prisma/
│   ├── schema.prisma    # Database schema (13 models)
│   └── seed.ts          # Seed data
├── scripts/
│   └── test-email.ts    # Email testing script 🆕
└── types/
    └── index.ts         # TypeScript types
```

---

## 📧 Email Features

### ส่ง Email อัตโนมัติเมื่อ:

1. ✅ **Forgot Password** - ลืมรหัสผ่าน
2. ✅ **Deposit Approved** - อนุมัติฝากเงิน
3. ✅ **Deposit Rejected** - ปฏิเสธฝากเงิน
4. ✅ **Withdrawal Approved** - อนุมัติถอนเงิน
5. ✅ **Welcome** - ต้อนรับสมาชิกใหม่ (ถ้าทำระบบสมัคร)
6. ✅ **Transaction** - แจ้งเตือนธุรกรรม

### Email Templates มี:
- 🎨 HTML สวยงาม
- 📱 Responsive design
- 🔗 Call-to-action buttons
- 💰 แสดงยอดเงิน
- ⚠️ Warning messages

---

## ⚙️ การตั้งค่า Gmail

### ขั้นตอนสำคัญ:

1. **เปิด 2-Factor Authentication** ใน Google Account
2. **สร้าง App Password** ใน Security settings
3. **คัดลอก App Password** (16 ตัวอักษร)
4. **ใส่ใน .env** → EMAIL_PASSWORD

**อ่านเพิ่มเติม:** `EMAIL_SETUP_GUIDE.md`

---

## 🔍 Troubleshooting

### Email ไม่ส่ง?

1. ตรวจสอบ .env มี EMAIL_USER และ EMAIL_PASSWORD
2. ตรวจสอบ App Password ถูกต้อง
3. ดู console log มี error อะไร
4. รัน `npx ts-node scripts/test-email.ts`

### Prisma Studio ไม่เปิด?

```bash
fix-prisma.bat
```

หรือ:
```bash
Remove-Item -Recurse -Force node_modules\.prisma
npx prisma generate
```

### Database connection error?

1. ตรวจสอบ DATABASE_URL ถูกต้อง
2. ตรวจสอบ MongoDB Atlas Network Access
3. ตรวจสอบ username/password

---

## 📚 เอกสารทั้งหมด

1. **README.md** - ภาพรวมโปรเจค
2. **API_DOCUMENTATION.md** - เอกสาร API ทั้งหมด
3. **EMAIL_SETUP_GUIDE.md** 🆕 - วิธีตั้งค่า Gmail SMTP
4. **FORGOT_PASSWORD_GUIDE.md** - วิธีใช้ระบบลืมรหัสผ่าน
5. **ACTIVITY_LOG_GUIDE.md** - วิธีใช้ Activity Logger
6. **MONGODB_SETUP.md** - วิธีตั้งค่า MongoDB
7. **SEED_INFO.md** - ข้อมูล Seed data
8. **TROUBLESHOOTING.md** - แก้ปัญหาที่พบบ่อย

---

## 🎉 คุณสมบัติทั้งหมด

### 📊 13 Models
User, Wallet, Transaction, Deposit, Withdrawal, Item, OwnedItem, Purchase, Gift, Transfer, DepositRate, ActivityLog, LoginHistory

### 🔌 35+ API Endpoints
ครบทุกฟีเจอร์ พร้อม Pagination และ Filtering

### 📧 6 Email Templates
สวยงาม Responsive พร้อมใช้งาน

### 🔐 Security Features
- Password hashing
- JWT sessions
- Role-based access control
- Activity logging
- Login history

### 🎨 UI/UX
- Modern design with Tailwind CSS
- Responsive (Mobile-friendly)
- แยก Layout Admin/User
- หน้า 404 custom
- Forgot password system

---

## 💡 Tips

1. **ใช้ MongoDB Atlas** - ฟรีและไม่ต้องติดตั้ง local
2. **ใช้ Prisma Studio** - ดูข้อมูลได้ง่าย
3. **เช็ค Activity Logs** - ดูว่าใครทำอะไร
4. **ทดสอบ Email** - ก่อนใช้งานจริง
5. **อ่าน API_DOCUMENTATION.md** - ดู API ทั้งหมด

---

**พร้อมใช้งานแล้ว! Let's go! 🚀**

