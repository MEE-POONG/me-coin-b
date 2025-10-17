# 💰 MeCoins - ระบบเติมเครดิต

ระบบจัดการเครดิตออนไลน์ที่สร้างด้วย Next.js, TypeScript, Tailwind CSS และ Prisma

## ✨ คุณสมบัติ

- 🔐 **ระบบ Authentication** - เข้าสู่ระบบด้วย NextAuth.js
- 👥 **แยกสิทธิ์การใช้งาน** - Admin และ User มี layout และฟีเจอร์แยกกัน
- 💳 **เติมเครดิต** - ผู้ใช้สามารถเติมเครดิตได้ง่าย
- 📊 **ประวัติการใช้งาน** - ดูประวัติการเติมและใช้เครดิตทั้งหมด
- 📈 **Dashboard แอดมิน** - จัดการผู้ใช้และดูสถิติทั้งหมด
- 🎨 **UI/UX ที่สวยงาม** - ออกแบบด้วย Tailwind CSS
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ
- ❌ **หน้า 404 แบบกำหนดเอง** - จัดการหน้าที่ไม่พบ

## 🚀 เริ่มต้นใช้งาน

### ข้อกำหนดเบื้องต้น

- Node.js 18+ 
- PostgreSQL
- npm หรือ yarn

### การติดตั้ง

1. **Clone โปรเจค**
   ```bash
   cd mecoins
   ```

2. **ติดตั้ง dependencies**
   ```bash
   npm install
   ```

3. **ตั้งค่า Environment Variables**
   
   สร้างไฟล์ `.env` และกำหนดค่าต่อไปนี้:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mecoins?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **ตั้งค่าฐานข้อมูล**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **รันโปรเจค**
   ```bash
   npm run dev
   ```

6. **เปิดเบราว์เซอร์**
   
   ไปที่ [http://localhost:3000](http://localhost:3000)

## 🔑 บัญชีทดสอบ

### Admin
- Email: `admin@example.com`
- Password: `admin123`
- สิทธิ์: จัดการผู้ใช้ ดูสถิติ และประวัติทั้งหมด

### User
- Email: `user@example.com`
- Password: `user123`
- สิทธิ์: เติมเครดิต และดูประวัติของตัวเอง

## 📁 โครงสร้างโปรเจค

```
mecoins/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # NextAuth endpoints
│   │   ├── admin/        # Admin APIs
│   │   ├── users/        # User APIs
│   │   └── transactions/ # Transaction APIs
│   ├── admin/            # หน้าแอดมิน
│   │   ├── users/        # จัดการผู้ใช้
│   │   └── transactions/ # ประวัติทั้งหมด
│   ├── dashboard/        # หน้าผู้ใช้
│   │   ├── topup/        # เติมเครดิต
│   │   └── history/      # ประวัติ
│   ├── login/            # หน้าเข้าสู่ระบบ
│   └── not-found.tsx     # หน้า 404
├── components/           # React Components
│   ├── AdminLayout.tsx   # Layout สำหรับแอดมิน
│   ├── UserLayout.tsx    # Layout สำหรับผู้ใช้
│   ├── Navbar.tsx        # Navigation bar
│   ├── Sidebar.tsx       # Sidebar menu
│   └── Card.tsx          # Card component
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding
└── types/
    └── index.ts         # TypeScript types
```

## 🎯 ฟีเจอร์หลัก

### สำหรับผู้ใช้ (User)
- ✅ แดชบอร์ดแสดงยอดเครดิตคงเหลือ
- ✅ เติมเครดิตพร้อมระบุหมายเหตุ
- ✅ ดูประวัติการเติมและใช้เครดิต (พร้อม Pagination)
- ✅ ตรวจสอบยอดคงเหลือแบบ Real-time

### สำหรับแอดมิน (Admin)
- ✅ Dashboard แสดงสถิติภาพรวม
  - จำนวนผู้ใช้ทั้งหมด
  - จำนวนธุรกรรมทั้งหมด
  - ยอดเติมเครดิตรวม
  - ยอดใช้เครดิตรวม
- ✅ จัดการผู้ใช้ทั้งหมด (พร้อม Pagination)
- ✅ ดูประวัติธุรกรรมทั้งหมดของทุกคน (พร้อม Pagination)

## 🔒 ระบบความปลอดภัย

- 🔐 Password hashing ด้วย bcrypt
- 🛡️ Protected routes ด้วย NextAuth middleware
- 🔑 JWT-based sessions
- 👮 Role-based access control (RBAC)
- ✋ API route protection

## 🗄️ Database Schema

### User
- id, email, name, password
- role (ADMIN/USER)
- balance (ยอดเครดิตคงเหลือ)
- createdAt, updatedAt

### Transaction
- id, userId, type (DEPOSIT/WITHDRAW)
- amount, description
- balanceBefore, balanceAfter
- createdAt

## 📦 เทคโนโลยีที่ใช้

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Password Hashing**: bcryptjs

## 🛠️ คำสั่งที่มีประโยชน์

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Prisma commands
npx prisma studio          # เปิด Prisma Studio
npx prisma generate        # Generate Prisma Client
npx prisma db push         # Push schema to database
npx prisma db seed         # Seed database
```

## 📝 License

MIT License - ใช้งานได้อย่างอิสระ

## 👨‍💻 Developer

สร้างโดย AI Assistant สำหรับการเรียนรู้และพัฒนาต่อยอด

---

**Happy Coding! 🚀**

