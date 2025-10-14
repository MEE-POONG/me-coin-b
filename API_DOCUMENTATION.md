# Coin Quest Wallet API Documentation

REST API สำหรับระบบจัดการ Wallet, ฝาก-ถอนเงิน, ซื้อขายไอเทม และโอนเงิน

## 🚀 Quick Start

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Push schema ไปยัง MongoDB
npm run prisma:push

# 4. รัน API Server
npm run dev:api

# หรือรัน Frontend + API พร้อมกัน
npm run dev:all
```

## 📡 Base URL

```
http://localhost:3001
```

## 🔗 API Endpoints Summary

| Resource | Endpoints |
|----------|-----------|
| **Users** | `GET /api/users`, `PUT /api/users`, `GET /api/users/:id/transactions` |
| **Deposits** | `GET /api/deposits`, `POST /api/deposits`, `PUT /api/deposits/approve`, `PUT /api/deposits/reject` |
| **Withdrawals** | `GET /api/withdrawals`, `POST /api/withdrawals`, `PUT /api/withdrawals/approve`, `PUT /api/withdrawals/reject` |
| **Items** | `GET /api/items`, `POST /api/items`, `PUT /api/items`, `DELETE /api/items`, `POST /api/items/purchase` |
| **Transfers** | `GET /api/transfers`, `POST /api/transfers` |
| **Deposit Rates** | `GET /api/deposit-rates`, `GET /api/deposit-rates/active`, `POST /api/deposit-rates`, `PUT /api/deposit-rates`, `DELETE /api/deposit-rates` |

---

## 👥 Users API

### GET /api/users
ดึงรายการ User พร้อม pagination

**Query Parameters:**
- `page` (number) - หน้าที่ต้องการ (default: 1)
- `pageSize` (number) - จำนวนต่อหน้า (default: 10)
- `keyword` (string) - ค้นหาจาก username, email, accountNumber
- `role` (string) - ADMIN, NORMAL, PREMIUM
- `id` (string) - ดึง User เดียว

**Response Example:**
```json
{
  "success": true,
  "data": [{
    "id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "wallet": { "balance": 1000 },
    "_count": { "deposits": 5, "withdrawals": 2 }
  }],
  "pagination": {
    "totalItems": 100,
    "totalPages": 10,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

### PUT /api/users
อัพเดทข้อมูล User

**Body:**
```json
{
  "id": "user_id",
  "username": "new_name",
  "email": "new@email.com",
  "avatar": "url",
  "role": "PREMIUM"
}
```

### GET /api/users/:id/transactions
ดึง Transaction history

**Query:** `type`, `status`, `page`, `pageSize`

---

## 💰 Deposits API

### POST /api/deposits
สร้างคำขอฝากเงิน

**Body:**
```json
{
  "userId": "...",
  "amount": 1000,
  "slipImage": "https://..."
}
```

### PUT /api/deposits/approve
อนุมัติคำขอฝากเงิน (อัพเดท Wallet อัตโนมัติ)

**Body:**
```json
{
  "id": "deposit_id",
  "comment": "อนุมัติแล้ว"
}
```

---

## 💸 Withdrawals API

### POST /api/withdrawals
สร้างคำขอถอนเงิน

**Body:**
```json
{
  "userId": "...",
  "amount": 500
}
```

### PUT /api/withdrawals/approve
อนุมัติคำขอถอนเงิน (หัก Wallet อัตโนมัติ)

---

## 🛍️ Items API

### GET /api/items
ดึงรายการไอเทม

**Query:** `category`, `rarity` (COMMON/RARE/EPIC/LEGENDARY), `keyword`

### POST /api/items
สร้างไอเทมใหม่

**Body:**
```json
{
  "name": "Legendary Sword",
  "description": "...",
  "price": 1000,
  "imageUrl": "...",
  "category": "Weapons",
  "rarity": "LEGENDARY"
}
```

### POST /api/items/purchase
ซื้อไอเทม (หักเงินและสร้าง Transaction อัตโนมัติ)

**Body:**
```json
{
  "userId": "...",
  "itemId": "..."
}
```

---

## 🔄 Transfers API

### POST /api/transfers
โอนเงิน (อัพเดท Wallet ทั้งคู่ทันที)

**Body:**
```json
{
  "senderId": "...",
  "receiverId": "...",
  "amount": 100,
  "comment": "ค่าอาหาร"
}
```

---

## 📊 Deposit Rates API

### GET /api/deposit-rates/active
ดึงอัตราแลกเปลี่ยนปัจจุบัน

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Promotion Rate",
    "rate": 1.5,
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "isActive": true
  }
}
```

---

## ✨ Key Features

- ✅ **Transaction Safety** - Prisma Transaction ทุกครั้งที่มีการเงิน
- ✅ **Wallet Management** - อัพเดท balance อัตโนมัติ
- ✅ **Validation** - ตรวจสอบข้อมูลและสิทธิ์
- ✅ **Search & Filter** - รองรับการค้นหาและกรอง
- ✅ **Pagination** - แบ่งหน้าทุก endpoint
- ✅ **Error Handling** - Response ที่สม่ำเสมอ

## 🔧 Development

```bash
# Prisma Studio (Database GUI)
npm run prisma:studio

# Generate Prisma Client หลังแก้ schema
npm run prisma:generate

# Push schema changes
npm run prisma:push
```

---

สร้างด้วย Express.js + TypeScript + Prisma + MongoDB
