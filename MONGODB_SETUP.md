# 🍃 MongoDB Setup Guide - MeCoins

## การตั้งค่า MongoDB สำหรับโปรเจค MeCoins

### 🔧 สิ่งที่เปลี่ยนแปลงสำหรับ MongoDB

1. ✅ เปลี่ยน `provider = "mongodb"` ใน schema.prisma
2. ✅ เปลี่ยน ID fields เป็น `@id @default(auto()) @map("_id") @db.ObjectId`
3. ✅ เพิ่ม `@db.ObjectId` ให้กับ foreign key fields ทั้งหมด
4. ✅ ลบ index ที่ไม่จำเป็นสำหรับ MongoDB
5. ✅ อัปเดต seed.ts ให้รองรับ MongoDB

---

## 🚀 วิธีตั้งค่า MongoDB

### ตัวเลือกที่ 1: MongoDB Atlas (Cloud - แนะนำ)

#### 1. สร้าง MongoDB Atlas Account
1. ไปที่ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. สร้างบัญชีฟรี
3. สร้าง Cluster ใหม่ (เลือก Free Tier)

#### 2. ตั้งค่า Database Access
1. ไปที่ Database Access → Add New Database User
2. เลือก Password authentication
3. สร้าง username และ password
4. ตั้งค่า privileges เป็น "Read and write to any database"

#### 3. ตั้งค่า Network Access
1. ไปที่ Network Access → Add IP Address
2. เลือก "Allow Access from Anywhere" (0.0.0.0/0)
   - หรือเพิ่ม IP ของคุณเอง

#### 4. ดึง Connection String
1. ไปที่ Database → Connect → Connect your application
2. เลือก Node.js driver
3. คัดลอก connection string

**รูปแบบ:**
```
mongodb+srv://username:password@cluster.mongodb.net/mecoins?retryWrites=true&w=majority
```

---

### ตัวเลือกที่ 2: MongoDB Local (Development)

#### ติดตั้ง MongoDB Community Edition

**Windows:**
1. ดาวน์โหลดจาก [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. ติดตั้งแบบ Complete
3. เลือก "Install MongoDB as a Service"
4. รัน MongoDB:
   ```bash
   net start MongoDB
   ```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Connection String สำหรับ Local:**
```
mongodb://localhost:27017/mecoins
```

---

## 📝 ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ root:

### สำหรับ MongoDB Atlas:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/mecoins?retryWrites=true&w=majority"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### สำหรับ MongoDB Local:
```env
DATABASE_URL="mongodb://localhost:27017/mecoins"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**สร้าง Secret Key:**
```bash
# Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))

# macOS/Linux
openssl rand -base64 32
```

---

## 🎯 Setup Database

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Push Schema to MongoDB
```bash
npx prisma db push
```

**หมายเหตุ:** MongoDB ไม่ใช้ migrations แบบ SQL databases ใช้ `db push` แทน

### 3. Seed ข้อมูลตัวอย่าง
```bash
npx prisma db seed
```

### 4. เปิด Prisma Studio (Optional)
```bash
npx prisma studio
```

---

## 🔍 ตรวจสอบการเชื่อมต่อ

### ทดสอบด้วย Node.js:

สร้างไฟล์ `test-connection.js`:
```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$connect()
    console.log('✅ Connected to MongoDB successfully!')
    
    const userCount = await prisma.user.count()
    console.log(`📊 Users in database: ${userCount}`)
    
  } catch (error) {
    console.error('❌ Connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

รัน:
```bash
node test-connection.js
```

---

## 📊 MongoDB vs PostgreSQL - ความแตกต่างสำคัญ

### 1. IDs
- **PostgreSQL**: `@id @default(cuid())`
- **MongoDB**: `@id @default(auto()) @map("_id") @db.ObjectId`

### 2. Foreign Keys
- **PostgreSQL**: `userId String`
- **MongoDB**: `userId String @db.ObjectId`

### 3. Indexes
- **PostgreSQL**: รองรับ composite indexes และ partial indexes
- **MongoDB**: index ที่ดีที่สุดจะถูกเลือกอัตโนมัติ

### 4. Migrations
- **PostgreSQL**: ใช้ `prisma migrate dev`
- **MongoDB**: ใช้ `prisma db push` (ไม่มี migration files)

### 5. Transactions
- **PostgreSQL**: รองรับเต็มรูปแบบ
- **MongoDB**: ต้องใช้ Replica Set หรือ Sharded Cluster

---

## ⚠️ ข้อควรระวัง MongoDB

### 1. Transactions ใน MongoDB

MongoDB transactions ต้องการ Replica Set:

**Atlas**: รองรับ transactions โดยอัตโนมัติ ✅

**Local**: ต้องตั้งค่า Replica Set:
```bash
# Start MongoDB as replica set
mongod --replSet rs0 --dbpath /data/db

# Initialize replica set (ใน mongo shell)
rs.initiate()
```

### 2. Cascading Deletes

MongoDB ไม่มี foreign key constraints แบบ SQL แต่ Prisma จะจัดการให้:
- `onDelete: Cascade` - Prisma จะลบ related records
- แต่ใช้เวลามากกว่า SQL databases

### 3. Index Performance

MongoDB สร้าง index อัตโนมัติสำหรับ:
- `_id` field
- unique fields
- foreign key fields (ที่ Prisma กำหนด)

---

## 🎨 Schema Features ที่รองรับ

### ✅ รองรับ
- Embedded documents (nested objects)
- Arrays
- ObjectId references
- Unique constraints
- Default values
- Enums
- Relations (1:1, 1:N, M:N)

### ❌ ไม่รองรับ
- Native SQL views
- Stored procedures
- CHECK constraints
- Custom SQL functions

---

## 🛠️ Commands ที่ใช้บ่อย

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Check schema changes
npx prisma db push --preview-feature
```

---

## 🔄 การ Reset Database

### MongoDB Atlas:
```bash
npx prisma db push --force-reset
```

### MongoDB Local:
```bash
# ใน mongo shell
use mecoins
db.dropDatabase()

# หรือ
npx prisma db push --force-reset
```

---

## 📱 MongoDB Compass (GUI Tool)

แนะนำให้ใช้ MongoDB Compass สำหรับจัดการ database:

1. ดาวน์โหลด: [MongoDB Compass](https://www.mongodb.com/products/compass)
2. เชื่อมต่อด้วย connection string
3. ดูและแก้ไขข้อมูลผ่าน GUI

**Features:**
- Query builder
- Index management
- Performance insights
- Schema visualization
- Aggregation pipeline builder

---

## 🚨 Troubleshooting

### ปัญหา: Connection timeout
```
Error: connect ETIMEDOUT
```
**แก้:** ตรวจสอบ Network Access ใน MongoDB Atlas

### ปัญหา: Authentication failed
```
Error: Authentication failed
```
**แก้:** ตรวจสอบ username/password ใน connection string

### ปัญหา: Transaction not supported
```
Error: Transactions are only supported for replica sets
```
**แก้:** 
- ใช้ MongoDB Atlas (รองรับโดยอัตโนมัติ)
- หรือตั้งค่า local replica set

### ปัญหา: Prisma Client outdated
```bash
# Re-generate
npx prisma generate
# Restart Next.js dev server
```

---

## 🎯 Performance Tips

1. **Index ที่สำคัญ**: MongoDB จะสร้างให้อัตโนมัติตาม schema
2. **Query optimization**: ใช้ `select` เพื่อดึงเฉพาะ fields ที่ต้องการ
3. **Pagination**: ใช้ `skip` และ `take` (มีอยู่แล้วในทุก API)
4. **Connection pooling**: Prisma จัดการให้อัตโนมัติ

---

## 📚 Resources

- [Prisma MongoDB Documentation](https://www.prisma.io/docs/concepts/database-connectors/mongodb)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/) - คอร์สฟรี

---

**ตอนนี้โปรเจคพร้อมใช้งานกับ MongoDB แล้ว! 🎉**

