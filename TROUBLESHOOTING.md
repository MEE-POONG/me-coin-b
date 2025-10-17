# 🔧 Troubleshooting Guide - MeCoins

## ปัญหาที่พบบ่อยและวิธีแก้ไข

---

## ❌ ปัญหา: ไม่สามารถเปิด Prisma Studio ได้

### อาการ:
```bash
npx prisma studio
# Error: Cannot connect to database
# หรือ Error: Prisma Client is not generated
```

### สาเหตุและวิธีแก้:

#### 1. ยังไม่มี `.env` file หรือ `DATABASE_URL` ไม่ถูกต้อง

**ตรวจสอบ:**
```bash
# ตรวจสอบว่ามีไฟล์ .env หรือไม่
dir .env

# ดูเนื้อหา .env
type .env
```

**แก้ไข:**
```bash
# สร้างไฟล์ .env จาก template
copy .env.example .env

# แก้ไข .env และใส่ MongoDB connection string
notepad .env
```

**MongoDB Atlas:**
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/mecoins?retryWrites=true&w=majority"
```

**MongoDB Local:**
```env
DATABASE_URL="mongodb://localhost:27017/mecoins"
```

---

#### 2. Prisma Client ยังไม่ได้ Generate

**แก้ไข:**
```bash
npx prisma generate
```

หากเจอ error `EPERM: operation not permitted`:
1. ปิด VS Code และ Terminal ทั้งหมด
2. เปิด Terminal ใหม่แบบ Administrator
3. รัน:
```bash
cd d:\web\new
npx prisma generate
```

---

#### 3. Database ยังไม่มี Schema

**แก้ไข:**
```bash
# Push schema to database
npx prisma db push
```

---

#### 4. ใช้ Batch Script แก้อัตโนมัติ

เราได้สร้างไฟล์ช่วยแก้ปัญหาให้แล้ว:

```bash
# Run ไฟล์นี้เพื่อแก้ปัญหา Prisma Client
fix-prisma.bat

# หรือ Setup ทั้งหมดใหม่
setup-mongodb.bat
```

---

## ❌ ปัญหา: EPERM: operation not permitted

### อาการ:
```
Error: EPERM: operation not permitted, rename 'query_engine-windows.dll.node.tmp'
```

### สาเหตุ:
- มีโปรเซสอื่นกำลังใช้ไฟล์อยู่ (VS Code, Terminal, Dev Server)
- Antivirus กำลัง scan ไฟล์

### วิธีแก้:

**วิธีที่ 1: ปิดโปรแกรมที่ใช้งานไฟล์**
1. ปิด VS Code ทั้งหมด
2. ปิด Terminal/PowerShell ทั้งหมด
3. ปิด `npm run dev` (ถ้ารันอยู่)
4. รอ 5 วินาที แล้วลองใหม่

**วิธีที่ 2: ลบและสร้างใหม่**
```bash
# ลบ Prisma Client เก่า
rmdir /s /q node_modules\.prisma
rmdir /s /q node_modules\@prisma\client

# Generate ใหม่
npx prisma generate
```

**วิธีที่ 3: ใช้ Script**
```bash
fix-prisma.bat
```

**วิธีที่ 4: Restart Computer**
ถ้าวิธีข้างบนไม่ได้ผล ให้ Restart เครื่อง

---

## ❌ ปัญหา: Cannot connect to MongoDB

### อาการ:
```
Error: Can't reach database server
Error: Authentication failed
Error: Connection timeout
```

### วิธีแก้:

#### 1. ตรวจสอบ Connection String

**MongoDB Atlas:**
- ตรวจสอบว่า username/password ถูกต้อง
- แทนที่ `<password>` ด้วยรหัสผ่านจริง
- แทนที่ `<cluster>` ด้วย cluster name จริง

**ตัวอย่าง:**
```env
# ❌ ผิด
DATABASE_URL="mongodb+srv://user:<password>@cluster.mongodb.net/mecoins"

# ✅ ถูก
DATABASE_URL="mongodb+srv://myuser:mySecretPass123@mycluster.abc123.mongodb.net/mecoins?retryWrites=true&w=majority"
```

#### 2. ตรวจสอบ Network Access (MongoDB Atlas)

1. เข้า [MongoDB Atlas](https://cloud.mongodb.com/)
2. Network Access → IP Access List
3. เพิ่ม IP ของคุณ หรือ Allow All (0.0.0.0/0)

#### 3. ตรวจสอบ Database User (MongoDB Atlas)

1. Database Access → Database Users
2. ตรวจสอบว่ามี user และ password ถูกต้อง
3. ตรวจสอบว่ามี privileges: "Read and write to any database"

#### 4. MongoDB Local ไม่ทำงาน

```bash
# ตรวจสอบว่า MongoDB รันอยู่หรือไม่
# Windows:
net start MongoDB

# ถ้ายังไม่มี MongoDB ติดตั้ง:
# ดาวน์โหลดจาก https://www.mongodb.com/try/download/community
```

---

## ❌ ปัญหา: Prisma Studio ค้าง/ช้า

### วิธีแก้:

1. **ปิด Studio และเปิดใหม่:**
```bash
# กด Ctrl+C เพื่อปิด
# แล้วเปิดใหม่
npx prisma studio
```

2. **เคลียร์ Browser Cache:**
- เปิด Studio URL (มักจะเป็น http://localhost:5555)
- กด `Ctrl+Shift+Delete`
- Clear cache

3. **ใช้ Browser อื่น:**
- ลอง Chrome, Firefox, หรือ Edge

---

## ❌ ปัญหา: seed ไม่ทำงาน

### อาการ:
```bash
npx prisma db seed
# Error: No seed script found
```

### วิธีแก้:

**ตรวจสอบ package.json:**
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**ติดตั้ง ts-node:**
```bash
npm install -D ts-node
```

**รัน seed:**
```bash
npx prisma db seed
```

---

## ❌ ปัญหา: TypeScript Errors

### อาการ:
```
Cannot find module '@prisma/client'
```

### วิธีแก้:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Restart TypeScript Server
# ใน VS Code: Ctrl+Shift+P
# พิมพ์: TypeScript: Restart TS Server

# 3. ถ้ายังไม่หาย ติดตั้ง dependencies ใหม่
npm install
```

---

## ❌ ปัญหา: npm install ล้มเหลว

### วิธีแก้:

```bash
# ลบ node_modules และ package-lock.json
rmdir /s /q node_modules
del package-lock.json

# ติดตั้งใหม่
npm install

# หรือใช้ --force
npm install --force
```

---

## ❌ ปัญหา: Next.js dev server ไม่ทำงาน

### วิธีแก้:

```bash
# ลบ .next cache
rmdir /s /q .next

# รันใหม่
npm run dev
```

---

## 🔍 คำสั่งตรวจสอบที่มีประโยชน์

```bash
# ตรวจสอบ schema ถูกต้องหรือไม่
npx prisma validate

# ดู Prisma version
npx prisma --version

# ดู Node version
node --version

# ดู npm version
npm --version

# ตรวจสอบ .env
type .env

# ตรวจสอบว่า MongoDB ถูก connect หรือไม่
npx prisma db push --preview-feature

# เปิด Prisma Studio
npx prisma studio

# ดู database schema
npx prisma db pull
```

---

## 🆘 ถ้าแก้ไม่ได้ทุกวิธี

### ขั้นตอนการ Reset ทั้งหมด:

```bash
# 1. ปิดโปรแกรมทั้งหมด (VS Code, Terminal)

# 2. ลบทุกอย่าง
rmdir /s /q node_modules
rmdir /s /q .next
del package-lock.json

# 3. ติดตั้งใหม่
npm install

# 4. Generate Prisma Client
npx prisma generate

# 5. Setup Database
npx prisma db push

# 6. Seed Data
npx prisma db seed

# 7. รัน Dev Server
npm run dev
```

หรือใช้ script:
```bash
setup-mongodb.bat
```

---

## 📞 ติดต่อขอความช่วยเหลือ

หากยังแก้ไม่ได้ กรุณาส่งข้อมูลต่อไปนี้:

1. Error message เต็มๆ
2. ผลลัพธ์จาก `npx prisma --version`
3. ผลลัพธ์จาก `node --version`
4. เนื้อหา `.env` (ซ่อนรหัสผ่าน)
5. ผลลัพธ์จาก `npx prisma validate`

---

## 💡 Tips เพิ่มเติม

1. **ใช้ MongoDB Atlas สำหรับการพัฒนา** - ง่ายกว่า local MongoDB
2. **เก็บ .env ใน .gitignore** - อย่า commit รหัสผ่าน
3. **Backup database เป็นประจำ** - ใช้ mongodump/mongorestore
4. **ใช้ Prisma Studio** - ง่ายกว่า MongoDB Compass
5. **อ่าน error message ให้ดี** - มักจะบอกวิธีแก้

---

**Happy Coding! 🚀**

