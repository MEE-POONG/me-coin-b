# API Project Structure

โครงสร้างไฟล์ของ Coin Quest Wallet API

## 📁 Directory Structure

```
api/
├── controllers/           # Business Logic & Database Operations
│   ├── userController.ts
│   ├── depositController.ts
│   ├── withdrawalController.ts
│   ├── itemController.ts
│   ├── transferController.ts
│   └── depositRateController.ts
│
├── routes/               # API Route Definitions
│   ├── userRoutes.ts
│   ├── depositRoutes.ts
│   ├── withdrawalRoutes.ts
│   ├── itemRoutes.ts
│   ├── transferRoutes.ts
│   └── depositRateRoutes.ts
│
├── middleware/           # Express Middleware (auth, validation, etc.)
│   └── (future middleware)
│
├── tsconfig.json        # TypeScript configuration for API
└── server.ts            # Main Express server entry point
```

## 🔄 Code Organization Pattern

### Controllers (`api/controllers/`)
- จัดการ business logic
- เชื่อมต่อกับ database ผ่าน Prisma
- ส่ง response กลับไปยัง client
- Format: `{resource}Controller.ts`

**Example:**
```typescript
// api/controllers/depositController.ts
import { Request, Response } from 'express'
import { prisma } from '../../src/lib/prisma'

export const getDeposits = async (req: Request, res: Response) => {
  // Logic here
}

export const createDeposit = async (req: Request, res: Response) => {
  // Logic here
}
```

### Routes (`api/routes/`)
- กำหนด HTTP endpoints
- เชื่อมต่อ URL paths กับ controller functions
- Format: `{resource}Routes.ts`

**Example:**
```typescript
// api/routes/depositRoutes.ts
import { Router } from 'express'
import {
  getDeposits,
  createDeposit,
  approveDeposit,
  rejectDeposit,
} from '../controllers/depositController'

const router = Router()

router.get('/', getDeposits)
router.post('/', createDeposit)
router.put('/approve', approveDeposit)
router.put('/reject', rejectDeposit)

export default router
```

### Server (`api/server.ts`)
- Main entry point
- รวม routes ทั้งหมด
- ตั้งค่า middleware (CORS, body-parser, etc.)

## 📋 Controller-Route Mapping

| Controller | Routes | Base URL |
|-----------|---------|----------|
| `userController.ts` | `userRoutes.ts` | `/api/users` |
| `depositController.ts` | `depositRoutes.ts` | `/api/deposits` |
| `withdrawalController.ts` | `withdrawalRoutes.ts` | `/api/withdrawals` |
| `itemController.ts` | `itemRoutes.ts` | `/api/items` |
| `transferController.ts` | `transferRoutes.ts` | `/api/transfers` |
| `depositRateController.ts` | `depositRateRoutes.ts` | `/api/deposit-rates` |

## ✅ Best Practices

### 1. Separation of Concerns
- **Controllers**: Business logic only
- **Routes**: Endpoint definitions only
- **Models**: Database schema (Prisma schema)

### 2. Naming Conventions
- Controllers: `export const functionName = async (req, res) => {}`
- Routes: Use descriptive HTTP methods and paths
- Files: camelCase with descriptive suffixes

### 3. Error Handling
ทุก controller ควรมี try-catch และส่ง response ที่สม่ำเสมอ:

```typescript
try {
  // Logic
  return res.status(200).json({
    success: true,
    data: result,
    message: '...'
  })
} catch (error) {
  console.error('Error:', error)
  return res.status(500).json({
    success: false,
    error: 'เกิดข้อผิดพลาด'
  })
}
```

### 4. Response Format
```typescript
// Success
{
  success: true,
  data: {...},
  pagination?: {...},
  message: string
}

// Error
{
  success: false,
  error: string
}
```

## 🚫 Anti-Patterns (สิ่งที่ไม่ควรทำ)

❌ **ห้ามผสม controller logic ในไฟล์ routes**
```typescript
// ❌ BAD - Don't do this
router.get('/', async (req, res) => {
  const data = await prisma.user.findMany()
  res.json(data)
})
```

✅ **แยก controller ออกมา**
```typescript
// ✅ GOOD
// routes/userRoutes.ts
router.get('/', getUsers)

// controllers/userController.ts
export const getUsers = async (req, res) => {
  const data = await prisma.user.findMany()
  res.json(data)
}
```

## 📦 Import Structure

```typescript
// Controllers
import { Request, Response } from 'express'
import { prisma } from '../../src/lib/prisma'
import { Prisma } from '@prisma/client'

// Routes
import { Router } from 'express'
import { functionName } from '../controllers/controllerName'
```

## 🔧 Adding New Endpoints

เมื่อต้องการเพิ่ม endpoint ใหม่:

1. สร้าง/แก้ไข controller function ใน `api/controllers/`
2. เพิ่ม route ใน `api/routes/`
3. Register route ใน `api/server.ts`
4. Test endpoint

Example:
```typescript
// 1. api/controllers/userController.ts
export const deleteUser = async (req, res) => { ... }

// 2. api/routes/userRoutes.ts
router.delete('/', deleteUser)

// 3. api/server.ts
app.use('/api/users', userRoutes)  // Already exists

// 4. Test
// DELETE /api/users
```

---

**Last Updated:** October 14, 2025
