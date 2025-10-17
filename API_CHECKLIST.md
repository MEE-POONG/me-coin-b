# ✅ API Checklist - MeCoins

## 📋 Models และ API ทั้งหมด

### ✅ Models: 13 ตัว

| # | Model | Description | Status |
|---|-------|-------------|--------|
| 1 | User | ผู้ใช้งาน | ✅ |
| 2 | Wallet | กระเป๋าเงิน | ✅ |
| 3 | Transaction | ธุรกรรมทั้งหมด | ✅ |
| 4 | Deposit | คำขอฝากเงิน | ✅ |
| 5 | Withdrawal | คำขอถอนเงิน | ✅ |
| 6 | Item | ไอเทมในร้านค้า | ✅ |
| 7 | OwnedItem | ไอเทมของผู้ใช้ | ✅ |
| 8 | Purchase | ประวัติซื้อ | ✅ |
| 9 | Gift | ของขวัญ | ✅ |
| 10 | Transfer | โอนเงิน | ✅ |
| 11 | DepositRate | อัตราฝาก | ✅ |
| 12 | ActivityLog | ประวัติกิจกรรม | ✅ |
| 13 | LoginHistory | ประวัติ Login | ✅ |

---

## 🔌 API Endpoints: 35+ endpoints

### 🔐 Authentication (3)
- ✅ `POST /api/auth/signin` - Login
- ✅ `POST /api/auth/signout` - Logout
- ✅ `GET /api/auth/session` - Get session

### 👤 Users (6)
- ✅ `GET /api/users/me` - ดูข้อมูลตัวเอง
- ✅ `GET /api/admin/users` - ดูผู้ใช้ทั้งหมด (Admin)
- ✅ `GET /api/admin/users/:id` - ดูข้อมูล user เดี่ยว (Admin) 🆕
- ✅ `PUT /api/admin/users/:id` - แก้ไข user (Admin) 🆕
- ✅ `DELETE /api/admin/users/:id` - ลบ user (Admin) 🆕
- ✅ `GET /api/admin/stats` - สถิติภาพรวม (Admin)

### 💰 Wallet (4)
- ✅ `GET /api/wallet` - ดู wallet ตัวเอง
- ✅ `POST /api/wallet` - สร้าง wallet
- ✅ `GET /api/wallet/:userId` - ดู wallet user อื่น (Admin) 🆕
- ✅ `PATCH /api/wallet/:userId` - ปรับยอดเงิน (Admin) 🆕

### 📊 Transactions (2)
- ✅ `GET /api/transactions` - ดูรายการ transaction
- ✅ `GET /api/transactions/:id` - ดูรายละเอียด transaction 🆕

### 💵 Deposits (4)
- ✅ `GET /api/deposits` - ดูรายการฝาก
- ✅ `POST /api/deposits` - สร้างคำขอฝาก
- ✅ `PATCH /api/deposits/:id` - อนุมัติ/ปฏิเสธ (Admin)
- ✅ `GET /api/admin/deposits/pending` - ดูคำขอฝากที่รอ (Admin) 🆕

### 💸 Withdrawals (4)
- ✅ `GET /api/withdrawals` - ดูรายการถอน
- ✅ `POST /api/withdrawals` - สร้างคำขอถอน
- ✅ `PATCH /api/withdrawals/:id` - อนุมัติ/ปฏิเสธ (Admin)
- ✅ `GET /api/admin/withdrawals/pending` - ดูคำขอถอนที่รอ (Admin) 🆕

### 🛍️ Items (5)
- ✅ `GET /api/items` - ดูรายการไอเทม
- ✅ `POST /api/items` - สร้างไอเทม (Admin)
- ✅ `GET /api/items/:id` - ดูไอเทมเดี่ยว
- ✅ `PUT /api/items/:id` - แก้ไขไอเทม (Admin)
- ✅ `DELETE /api/items/:id` - ลบไอเทม (Admin)

### 🎒 Owned Items (1)
- ✅ `GET /api/owned-items` - ดูไอเทมที่เป็นเจ้าของ

### 🛒 Purchases (2)
- ✅ `GET /api/purchases` - ดูประวัติซื้อ
- ✅ `POST /api/purchases` - ซื้อไอเทม

### 🎁 Gifts (2)
- ✅ `GET /api/gifts` - ดูประวัติของขวัญ
- ✅ `POST /api/gifts` - ส่งของขวัญ

### 🔄 Transfers (2)
- ✅ `GET /api/transfers` - ดูประวัติโอนเงิน
- ✅ `POST /api/transfers` - โอนเงิน

### 💎 Deposit Rates (4)
- ✅ `GET /api/deposit-rates` - ดูอัตราแลกเปลี่ยน
- ✅ `POST /api/deposit-rates` - สร้างอัตรา (Admin)
- ✅ `PUT /api/deposit-rates/:id` - แก้ไขอัตรา (Admin)
- ✅ `DELETE /api/deposit-rates/:id` - ลบอัตรา (Admin)

### 📝 Activity & Login (2)
- ✅ `GET /api/activity-logs` - ดูประวัติกิจกรรม
- ✅ `GET /api/login-history` - ดูประวัติ login

### 📊 Admin Dashboard (1) 🆕
- ✅ `GET /api/admin/dashboard` - Dashboard ครบวงจร

---

## 🎯 API ที่เพิ่มใหม่ (7 endpoints)

### 1. ✅ จัดการ User แบบเจาะจง
- `GET /api/admin/users/:id` - ดูข้อมูล user พร้อม wallet และสถิติ
- `PUT /api/admin/users/:id` - แก้ไข username, email, role, avatar
- `DELETE /api/admin/users/:id` - ลบ user (ป้องกันลบตัวเอง)

### 2. ✅ จัดการ Wallet ของ User อื่น
- `GET /api/wallet/:userId` - ดู wallet ของ user อื่น (Admin หรือตัวเอง)
- `PATCH /api/wallet/:userId` - ปรับยอดเงิน manual (Admin only)

### 3. ✅ ดูรายละเอียด Transaction
- `GET /api/transactions/:id` - ดูข้อมูลครบถ้วนของ transaction เดี่ยว

### 4. ✅ รายการรอ Admin อนุมัติ
- `GET /api/admin/deposits/pending` - คำขอฝากที่รอ (เรียงเก่าสุดก่อน)
- `GET /api/admin/withdrawals/pending` - คำขอถอนที่รอ (เรียงเก่าสุดก่อน)

### 5. ✅ Dashboard Admin ครบวงจร
- `GET /api/admin/dashboard` - สถิติครบทุกมิติ

---

## 📈 Features ของ API ใหม่

### Admin Dashboard Endpoint
```typescript
GET /api/admin/dashboard

Response:
{
  "overview": {
    "totalUsers": 150,
    "totalTransactions": 1250,
    "pendingDeposits": 5,
    "pendingWithdrawals": 3,
    "totalDeposits": 250000,
    "totalWithdrawals": 180000,
    "totalBalance": 500000
  },
  "today": {
    "transactions": 45,
    "newUsers": 3,
    "deposits": 15000,
    "withdrawals": 8000
  },
  "usersByRole": [
    { "role": "ADMIN", "count": 2 },
    { "role": "NORMAL", "count": 120 },
    { "role": "PREMIUM", "count": 28 }
  ],
  "recentTransactions": [...]
}
```

### Manual Wallet Adjustment
```typescript
PATCH /api/wallet/:userId
Body: {
  "adjustment": 1000,      // +1000 เพิ่ม, -1000 ลด
  "reason": "Bonus reward"
}
```

### Pending Approvals
```typescript
GET /api/admin/deposits/pending
GET /api/admin/withdrawals/pending

// เรียงเก่าสุดก่อน เพื่อ Admin ดูตามลำดับ
// รวม user info และ wallet balance
```

---

## 🔒 Permission Matrix

| Endpoint | USER | PREMIUM | ADMIN |
|----------|------|---------|-------|
| GET /api/users/me | ✅ | ✅ | ✅ |
| GET /api/admin/users | ❌ | ❌ | ✅ |
| PUT /api/admin/users/:id | ❌ | ❌ | ✅ |
| DELETE /api/admin/users/:id | ❌ | ❌ | ✅ |
| GET /api/wallet | ✅ | ✅ | ✅ |
| GET /api/wallet/:userId | 👤 | 👤 | ✅ |
| PATCH /api/wallet/:userId | ❌ | ❌ | ✅ |
| GET /api/transactions | ✅ | ✅ | ✅ |
| GET /api/transactions/:id | 👤 | 👤 | ✅ |
| POST /api/deposits | ✅ | ✅ | ✅ |
| PATCH /api/deposits/:id | ❌ | ❌ | ✅ |
| GET /api/admin/deposits/pending | ❌ | ❌ | ✅ |
| POST /api/withdrawals | ✅ | ✅ | ✅ |
| PATCH /api/withdrawals/:id | ❌ | ❌ | ✅ |
| GET /api/admin/withdrawals/pending | ❌ | ❌ | ✅ |
| POST /api/items | ❌ | ❌ | ✅ |
| PUT /api/items/:id | ❌ | ❌ | ✅ |
| DELETE /api/items/:id | ❌ | ❌ | ✅ |
| POST /api/purchases | ✅ | ✅ | ✅ |
| POST /api/gifts | ✅ | ✅ | ✅ |
| POST /api/transfers | ✅ | ✅ | ✅ |
| GET /api/activity-logs | 👤 | 👤 | ✅ |
| GET /api/login-history | 👤 | 👤 | ✅ |
| GET /api/admin/dashboard | ❌ | ❌ | ✅ |

**สัญลักษณ์:**
- ✅ = เข้าถึงได้
- ❌ = เข้าถึงไม่ได้
- 👤 = เข้าถึงได้เฉพาะของตัวเอง (Admin ดูทั้งหมดได้)

---

## 🎨 Activity Logging

API ที่มีการบันทึก Activity Log:
- ✅ PUT /api/admin/users/:id - userUpdated
- ✅ DELETE /api/admin/users/:id - userDeleted
- ✅ PATCH /api/wallet/:userId - wallet adjustment
- ✅ PATCH /api/deposits/:id - depositApproved/Rejected
- ✅ PATCH /api/withdrawals/:id - withdrawalApproved/Rejected
- ✅ POST /api/items - itemCreated
- ✅ PUT /api/items/:id - itemUpdated
- ✅ DELETE /api/items/:id - itemDeleted
- ✅ POST /api/purchases - itemPurchased
- ✅ POST /api/gifts - giftSent
- ✅ POST /api/transfers - transferCreated

---

## ✨ สรุป

### จำนวน API ทั้งหมด: **35+ endpoints**

**แบ่งตาม Function:**
- Authentication: 3
- User Management: 6
- Wallet: 4
- Transactions: 2
- Deposits: 4
- Withdrawals: 4
- Items: 5
- Owned Items: 1
- Purchases: 2
- Gifts: 2
- Transfers: 2
- Deposit Rates: 4
- Activity & Login: 2
- Admin Dashboard: 1

**แบ่งตาม Role:**
- Public: 3 (auth)
- User/Premium: 18
- Admin Only: 14
- All Roles: 35

---

## 🚀 Next Steps

หากต้องการเพิ่ม API เพิ่มเติม:

### Suggestions:
1. ✨ GET /api/admin/reports - สร้าง reports ต่างๆ
2. ✨ POST /api/users/register - สมัครสมาชิก
3. ✨ PUT /api/users/me - แก้ไขข้อมูลตัวเอง
4. ✨ PUT /api/users/me/password - เปลี่ยนรหัสผ่าน
5. ✨ GET /api/admin/analytics - วิเคราะห์ข้อมูล
6. ✨ POST /api/notifications - ระบบแจ้งเตือน
7. ✨ GET /api/admin/exports - Export ข้อมูล CSV/Excel

---

**ระบบ MeCoins มี API ครบถ้วนพร้อมใช้งานจริง! 🎉**

