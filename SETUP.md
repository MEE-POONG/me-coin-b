# 🚀 คู่มือการติดตั้งโปรเจค MeCoins

## ขั้นตอนการติดตั้งแบบละเอียด

### 1. ตรวจสอบความพร้อม

ตรวจสอบว่าคุณมีโปรแกรมที่จำเป็นติดตั้งแล้ว:

```bash
node --version   # ต้องเป็น v18 หรือสูงกว่า
npm --version
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

หรือถ้าใช้ yarn:
```bash
yarn install
```

### 3. ตั้งค่า PostgreSQL

#### ติดตั้ง PostgreSQL (ถ้ายังไม่มี)

**Windows:**
- ดาวน์โหลดจาก [postgresql.org](https://www.postgresql.org/download/windows/)
- ติดตั้งและจดจำ password ที่ตั้งไว้

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### สร้าง Database

```bash
# เข้าสู่ PostgreSQL
psql -U postgres

# สร้างฐานข้อมูล
CREATE DATABASE mecoins;

# ออกจาก psql
\q
```

### 4. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
# URL ของฐานข้อมูล PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/mecoins?schema=public"

# URL ของแอพพลิเคชัน
NEXTAUTH_URL="http://localhost:3000"

# Secret key สำหรับ NextAuth (สร้างแบบสุ่ม)
NEXTAUTH_SECRET="your-secret-key-change-this-to-random-string"
```

**หมายเหตุ:** 
- แทนที่ `password` ด้วยรหัสผ่าน PostgreSQL ของคุณ
- สร้าง `NEXTAUTH_SECRET` ด้วยคำสั่ง:
  ```bash
  openssl rand -base64 32
  ```

### 5. ตั้งค่าฐานข้อมูล

```bash
# Generate Prisma Client
npx prisma generate

# สร้างตารางในฐานข้อมูล
npx prisma db push

# เพิ่มข้อมูลตัวอย่าง
npx prisma db seed
```

### 6. รันโปรเจค

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่: [http://localhost:3000](http://localhost:3000)

## 🎯 ทดสอบการทำงาน

### เข้าสู่ระบบด้วยบัญชีทดสอบ

**แอดมิน:**
- Email: `admin@example.com`
- Password: `admin123`

**ผู้ใช้:**
- Email: `user@example.com`
- Password: `user123`

## 🛠️ คำสั่งที่มีประโยชน์

```bash
# เปิด Prisma Studio (GUI สำหรับดูข้อมูล)
npx prisma studio

# Reset ฐานข้อมูล
npx prisma db push --force-reset

# Seed ข้อมูลใหม่
npx prisma db seed

# Build สำหรับ production
npm run build

# รัน production
npm start
```

## ❗ แก้ปัญหา

### ปัญหา: ติดตั้ง dependencies ไม่สำเร็จ
```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install
```

### ปัญหา: เชื่อมต่อฐานข้อมูลไม่ได้
- ตรวจสอบว่า PostgreSQL รันอยู่
- ตรวจสอบ `DATABASE_URL` ใน `.env` ว่าถูกต้อง
- ทดสอบเชื่อมต่อ:
  ```bash
  psql -U postgres -d mecoins
  ```

### ปัญหา: Prisma error
```bash
# Generate Prisma Client ใหม่
npx prisma generate

# Push schema ใหม่
npx prisma db push
```

### ปัญหา: หน้าเว็บแสดงไม่ถูกต้อง
```bash
# ลบ .next และ build ใหม่
rm -rf .next
npm run dev
```

## 📚 เอกสารเพิ่มเติม

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎓 โครงสร้างโปรเจคสำคัญ

```
mecoins/
├── .env                  # Environment variables (สร้างเอง)
├── prisma/
│   └── schema.prisma     # Schema ฐานข้อมูล
├── app/
│   ├── api/              # API endpoints
│   ├── dashboard/        # หน้าผู้ใช้
│   ├── admin/            # หน้าแอดมิน
│   └── login/            # หน้า login
├── components/           # React components
└── lib/                  # Helper functions
```

## 💡 Tips

1. **ใช้ Prisma Studio** เพื่อดูและแก้ไขข้อมูลในฐานข้อมูล:
   ```bash
   npx prisma studio
   ```

2. **Debug การ login** โดยดูที่ Console ของเบราว์เซอร์และ Terminal

3. **เพิ่มผู้ใช้ใหม่** ผ่าน Prisma Studio หรือแก้ไขไฟล์ `prisma/seed.ts`

## ✅ Checklist การติดตั้ง

- [ ] ติดตั้ง Node.js 18+
- [ ] ติดตั้ง PostgreSQL
- [ ] สร้างฐานข้อมูล `mecoins`
- [ ] สร้างไฟล์ `.env`
- [ ] ตั้งค่า `DATABASE_URL` และ `NEXTAUTH_SECRET`
- [ ] รัน `npm install`
- [ ] รัน `npx prisma generate`
- [ ] รัน `npx prisma db push`
- [ ] รัน `npx prisma db seed`
- [ ] รัน `npm run dev`
- [ ] เปิด http://localhost:3000
- [ ] ทดสอบ login ด้วยบัญชีตัวอย่าง

---

หากมีปัญหาหรือข้อสงสัย ตรวจสอบไฟล์ README.md หรือเปิด issue ในโปรเจค

