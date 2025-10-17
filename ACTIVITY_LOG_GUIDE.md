# 📝 Activity Log & Login History Guide

## ระบบบันทึกประวัติการใช้งาน MeCoins

---

## 🎯 ภาพรวม

ระบบนี้มี 2 ส่วนหลัก:

### 1. Activity Log (กิจกรรมทั้งหมด)
เก็บบันทึกการกระทำต่างๆ ใน ระบบ:
- สร้าง (CREATE)
- อ่าน (READ) 
- แก้ไข (UPDATE)
- ลบ (DELETE)
- อนุมัติ (APPROVE)
- ปฏิเสธ (REJECT)

### 2. Login History (ประวัติการเข้าสู่ระบบ)
เก็บบันทึกการ Login:
- Login สำเร็จ
- Login ไม่สำเร็จ (พร้อมเหตุผล)
- IP Address และ User Agent

---

## 📊 Schema Models

### ActivityLog
```prisma
model ActivityLog {
  id          String         @id
  userId      String         // ผู้ทำ
  action      ActivityAction // CREATE, UPDATE, DELETE, etc.
  model       String         // model ที่ถูกกระทำ เช่น "Item", "User"
  modelId     String?        // ID ของ record
  oldData     String?        // ข้อมูลเดิม (JSON)
  newData     String?        // ข้อมูลใหม่ (JSON)
  description String?        // คำอธิบาย
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime
}
```

### LoginHistory
```prisma
model LoginHistory {
  id         String
  userId     String
  ipAddress  String
  userAgent  String
  success    Boolean        // สำเร็จหรือไม่
  failReason String?        // เหตุผลที่ไม่สำเร็จ
  createdAt  DateTime
}
```

---

## 🔌 API Endpoints

### 1. GET /api/activity-logs
ดูประวัติกิจกรรมทั้งหมด

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 20)
- `action` (optional): CREATE, UPDATE, DELETE, APPROVE, REJECT
- `model` (optional): User, Item, Transaction, Deposit, etc.
- `userId` (optional, Admin only): ดูของ user คนอื่น

**Response:**
```json
{
  "logs": [
    {
      "id": "...",
      "userId": "...",
      "action": "CREATE",
      "model": "Item",
      "modelId": "...",
      "oldData": null,
      "newData": "{...}",
      "description": "สร้างไอเทม: Bronze Sword",
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "id": "...",
        "username": "admin",
        "email": "admin@example.com"
      }
    }
  ],
  "pagination": {
    "totalItems": 150,
    "totalPages": 8,
    "currentPage": 1,
    "pageSize": 20
  }
}
```

**ตัวอย่างการเรียกใช้:**
```typescript
// ดูทั้งหมด
const res = await fetch('/api/activity-logs?page=1&pageSize=20')

// Filter ตาม action
const res = await fetch('/api/activity-logs?action=CREATE')

// Filter ตาม model
const res = await fetch('/api/activity-logs?model=Item')

// Admin ดูของ user คนอื่น
const res = await fetch('/api/activity-logs?userId=USER_ID')
```

---

### 2. GET /api/login-history
ดูประวัติการเข้าสู่ระบบ

**Query Parameters:**
- `page` (optional, default: 1)
- `pageSize` (optional, default: 20)
- `userId` (optional, Admin only)

**Response:**
```json
{
  "history": [
    {
      "id": "...",
      "userId": "...",
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "failReason": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "id": "...",
        "username": "admin",
        "email": "admin@example.com"
      }
    }
  ],
  "pagination": {...}
}
```

---

## 💻 วิธีใช้งาน Activity Logger

### ตัวอย่างที่ 1: บันทึกการสร้าง Item

```typescript
import { ActivityLogger } from '@/lib/activity-logger'
import { getClientInfo } from '@/lib/get-client-info'

// สร้าง item
const item = await prisma.item.create({
  data: { name: 'Dragon Sword', price: 1000, ... }
})

// บันทึก log
const { ip, userAgent } = getClientInfo(request)
await ActivityLogger.itemCreated(
  session.user.id,
  item,
  ip,
  userAgent
)
```

---

### ตัวอย่างที่ 2: บันทึกการแก้ไข

```typescript
// ดึงข้อมูลเดิม
const oldItem = await prisma.item.findUnique({ where: { id } })

// อัพเดท
const newItem = await prisma.item.update({
  where: { id },
  data: { price: 1500 }
})

// บันทึก log
await ActivityLogger.itemUpdated(
  session.user.id,
  id,
  oldItem,    // ข้อมูลเดิม
  newItem,    // ข้อมูลใหม่
  ip,
  userAgent
)
```

---

### ตัวอย่างที่ 3: บันทึกการลบ

```typescript
// ดึงข้อมูลก่อนลบ
const item = await prisma.item.findUnique({ where: { id } })

// ลบ
await prisma.item.delete({ where: { id } })

// บันทึก log
await ActivityLogger.itemDeleted(
  session.user.id,
  id,
  item,
  ip,
  userAgent
)
```

---

### ตัวอย่างที่ 4: บันทึกการอนุมัติ Deposit

```typescript
// อนุมัติ deposit
const deposit = await prisma.deposit.update({
  where: { id },
  data: { status: 'APPROVED' }
})

// บันทึก log
await ActivityLogger.depositApproved(
  session.user.id,
  id,
  deposit,
  ip,
  userAgent
)
```

---

### ตัวอย่างที่ 5: บันทึก Login

```typescript
// Login สำเร็จ
await ActivityLogger.loginSuccess(
  user.id,
  ipAddress,
  userAgent
)

// Login ไม่สำเร็จ
await ActivityLogger.loginFailed(
  user.id,
  ipAddress,
  userAgent,
  'รหัสผ่านไม่ถูกต้อง'
)
```

---

## 🛠️ Activity Logger Functions ทั้งหมด

### User Activities
- `userCreated(userId, data, ip, ua)`
- `userUpdated(userId, modelId, oldData, newData, ip, ua)`
- `userDeleted(userId, modelId, data, ip, ua)`

### Deposit Activities
- `depositCreated(userId, data, ip, ua)`
- `depositApproved(userId, modelId, data, ip, ua)`
- `depositRejected(userId, modelId, data, ip, ua)`

### Withdrawal Activities
- `withdrawalCreated(userId, data, ip, ua)`
- `withdrawalApproved(userId, modelId, data, ip, ua)`
- `withdrawalRejected(userId, modelId, data, ip, ua)`

### Item Activities
- `itemCreated(userId, data, ip, ua)`
- `itemUpdated(userId, modelId, oldData, newData, ip, ua)`
- `itemDeleted(userId, modelId, data, ip, ua)`

### Purchase Activities
- `itemPurchased(userId, data, ip, ua)`

### Gift Activities
- `giftSent(userId, data, ip, ua)`

### Transfer Activities
- `transferCreated(userId, data, ip, ua)`

### Login Activities
- `loginSuccess(userId, ip, ua)`
- `loginFailed(userId, ip, ua, reason)`

---

## 🔒 การตรวจสอบสิทธิ์

### สำหรับ User (NORMAL/PREMIUM):
- ดูได้เฉพาะ activity log ของตัวเอง
- ดูได้เฉพาะ login history ของตัวเอง

### สำหรับ Admin:
- ดู activity log ของทุกคนได้
- Filter ตาม userId ได้
- ดู login history ของทุกคนได้

---

## 📈 ตัวอย่างการใช้งานใน Component

### React Component สำหรับแสดง Activity Logs

```typescript
'use client'

import { useEffect, useState } from 'react'
import { ActivityLogResponse } from '@/types'

export default function ActivityLogsPage() {
  const [data, setData] = useState<ActivityLogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchLogs(currentPage)
  }, [currentPage])

  const fetchLogs = async (page: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/activity-logs?page=${page}&pageSize=20`)
      if (res.ok) {
        const data = await res.json()
        setData(data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !data) {
    return <div>กำลังโหลด...</div>
  }

  return (
    <div>
      <h1>ประวัติกิจกรรม</h1>
      
      <table>
        <thead>
          <tr>
            <th>วันที่</th>
            <th>ผู้ใช้</th>
            <th>การกระทำ</th>
            <th>รายละเอียด</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {data?.logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.createdAt).toLocaleString('th-TH')}</td>
              <td>{log.user?.username}</td>
              <td>
                <span className={`badge badge-${getActionColor(log.action)}`}>
                  {getActionLabel(log.action)}
                </span>
              </td>
              <td>{log.description}</td>
              <td>{log.ipAddress}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div>
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          ก่อนหน้า
        </button>
        <span>หน้า {currentPage} จาก {data?.pagination.totalPages}</span>
        <button 
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === data?.pagination.totalPages}
        >
          ถัดไป
        </button>
      </div>
    </div>
  )
}

function getActionColor(action: string) {
  switch (action) {
    case 'CREATE': return 'success'
    case 'UPDATE': return 'warning'
    case 'DELETE': return 'danger'
    case 'APPROVE': return 'success'
    case 'REJECT': return 'danger'
    default: return 'secondary'
  }
}

function getActionLabel(action: string) {
  switch (action) {
    case 'CREATE': return 'สร้าง'
    case 'READ': return 'อ่าน'
    case 'UPDATE': return 'แก้ไข'
    case 'DELETE': return 'ลบ'
    case 'APPROVE': return 'อนุมัติ'
    case 'REJECT': return 'ปฏิเสธ'
    case 'LOGIN': return 'เข้าสู่ระบบ'
    case 'LOGOUT': return 'ออกจากระบบ'
    default: return action
  }
}
```

---

## 🎨 UI Components

### Activity Badge
```tsx
<span className={`px-2 py-1 rounded text-sm ${
  log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
  log.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
  log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
  'bg-gray-100 text-gray-800'
}`}>
  {log.action}
</span>
```

### Login Status Badge
```tsx
<span className={`px-2 py-1 rounded text-sm ${
  history.success 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800'
}`}>
  {history.success ? '✅ สำเร็จ' : '❌ ไม่สำเร็จ'}
</span>
```

---

## 📊 การวิเคราะห์ข้อมูล

### ดู Activity ล่าสุด 10 รายการ
```typescript
const recentLogs = await prisma.activityLog.findMany({
  take: 10,
  orderBy: { createdAt: 'desc' },
  include: { user: true }
})
```

### นับจำนวน Action แต่ละประเภท
```typescript
const stats = await prisma.activityLog.groupBy({
  by: ['action'],
  _count: true
})
```

### ดู Login Attempts ที่ล้มเหลว
```typescript
const failedLogins = await prisma.loginHistory.findMany({
  where: { success: false },
  orderBy: { createdAt: 'desc' }
})
```

---

## 🔍 การค้นหาและ Filter

### Filter ตาม Date Range
```typescript
const logs = await prisma.activityLog.findMany({
  where: {
    createdAt: {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-01-31')
    }
  }
})
```

### Filter หลายเงื่อนไข
```typescript
const logs = await prisma.activityLog.findMany({
  where: {
    AND: [
      { action: 'DELETE' },
      { model: 'Item' },
      { userId: specificUserId }
    ]
  }
})
```

---

## 💡 Best Practices

1. **เก็บข้อมูลสำคัญเท่านั้น**: อย่าเก็บ password หรือข้อมูลที่sensitive
2. **ใช้ async**: การ log ไม่ควรทำให้ระบบช้า
3. **Handle errors**: log ไม่ควร throw error ทำให้ระบบหลักเสีย
4. **Archive old logs**: ย้ายข้อมูลเก่าๆ ออกเป็นระยะ
5. **Index properly**: ใส่ index ที่ `userId`, `createdAt`, `action`

---

## 🗑️ Data Retention

### ลบ Log เก่ากว่า 90 วัน
```typescript
await prisma.activityLog.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }
  }
})
```

---

**การบันทึก Activity Log ช่วยให้:**
- ✅ ตรวจสอบการทำงานของระบบ
- ✅ Audit trail สำหรับตรวจสอบ
- ✅ Debug ปัญหาที่เกิดขึ้น
- ✅ ตรวจจับพฤติกรรมผิดปกติ
- ✅ วิเคราะห์การใช้งาน

