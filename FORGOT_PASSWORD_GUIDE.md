# 🔐 Forgot Password System Guide

## ระบบลืมรหัสผ่าน MeCoins

---

## 🎯 Features

ระบบลืมรหัสผ่านของ MeCoins รองรับการค้นหาด้วย 3 วิธี:

1. ✅ **Email** - ค้นหาด้วยอีเมล
2. ✅ **Username** - ค้นหาด้วยชื่อผู้ใช้
3. ✅ **Discord ID** - ค้นหาด้วย Discord ID (ถ้ามีการเชื่อมต่อ)

---

## 📋 Flow การทำงาน

### Step 1: ค้นหาบัญชี
1. ผู้ใช้เข้าหน้า `/forgot-password`
2. กรอก Email, Username หรือ Discord ID
3. ระบบค้นหาใน database
4. ถ้าพบ → แสดงข้อมูล user และไปขั้นตอนต่อไป
5. ถ้าไม่พบ → แสดง error

### Step 2: ตั้งรหัสผ่านใหม่
1. แสดงข้อมูล user ที่พบ (username, email)
2. กรอกรหัสผ่านใหม่
3. กรอกยืนยันรหัสผ่าน
4. ตรวจสอบว่าตรงกัน และยาวอย่างน้อย 6 ตัวอักษร
5. บันทึกรหัสผ่านใหม่ (hash ด้วย bcrypt)
6. บันทึก Activity Log
7. Redirect ไป /login

---

## 🔌 API Endpoints

### 1. POST /api/auth/forgot-password
ค้นหา user จาก email, username หรือ discordId

**Request:**
```json
{
  "identifier": "user@example.com"
  // or "normaluser"
  // or "discord123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "พบผู้ใช้ในระบบ",
  "user": {
    "id": "user-id",
    "username": "normaluser",
    "email": "user@example.com"
  },
  "resetToken": "token-here"
}
```

**Response (Not Found):**
```json
{
  "error": "ไม่พบผู้ใช้นี้ในระบบ"
}
```

---

### 2. POST /api/auth/reset-password
เปลี่ยนรหัสผ่านใหม่

**Request:**
```json
{
  "userId": "user-id-from-step-1",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "เปลี่ยนรหัสผ่านสำเร็จ"
}
```

**Response (Error):**
```json
{
  "error": "รหัสผ่านไม่ตรงกัน"
}
// or
{
  "error": "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
}
```

---

## 🎨 UI Features

### หน้า Forgot Password (`/forgot-password`)

**Step 1: Search Form**
- Input field สำหรับค้นหา (รองรับ email, username, discord ID)
- ปุ่มค้นหา
- Link กลับไป /login
- คำแนะนำการใช้งาน

**Step 2: Reset Password Form**
- แสดงข้อมูล user ที่พบ (username, email)
- Input รหัสผ่านใหม่
- Input ยืนยันรหัสผ่าน
- ปุ่มย้อนกลับ
- ปุ่มตั้งรหัสผ่านใหม่
- หมายเหตุเงื่อนไขรหัสผ่าน

---

## 🔒 Security Features

### 1. Password Validation
```typescript
- ต้องยาวอย่างน้อย 6 ตัวอักษร
- ต้องตรงกับ confirmPassword
- Hash ด้วย bcrypt (10 rounds)
```

### 2. User Lookup
```typescript
// ค้นหาจาก 3 ฟิลด์พร้อมกัน
const user = await prisma.user.findFirst({
  where: {
    OR: [
      { email: identifier },
      { username: identifier },
      { discordId: identifier },
    ],
  },
})
```

### 3. Activity Logging
```typescript
// บันทึกการรีเซ็ตรหัสผ่าน
await ActivityLogger.logActivity({
  userId: userId,
  action: 'UPDATE',
  model: 'User',
  description: 'รีเซ็ตรหัสผ่าน',
  ipAddress: ip,
  userAgent: userAgent,
})
```

---

## 💡 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: ค้นหาด้วย Email
```
Input: user@example.com
→ พบ user ✅
→ ตั้งรหัสผ่านใหม่
→ สำเร็จ!
```

### ตัวอย่างที่ 2: ค้นหาด้วย Username
```
Input: normaluser
→ พบ user ✅
→ ตั้งรหัสผ่านใหม่
→ สำเร็จ!
```

### ตัวอย่างที่ 3: ค้นหาด้วย Discord ID
```
Input: 123456789012345678
→ พบ user ✅
→ ตั้งรหัสผ่านใหม่
→ สำเร็จ!
```

---

## 🚀 การทดสอบ

### ทดสอบด้วยบัญชีตัวอย่าง:

**Admin:**
- Email: `admin@example.com`
- Username: `admin`
- Password: `admin123` (ใหม่หลัง reset)

**Normal User:**
- Email: `user@example.com`
- Username: `normaluser`
- Password: `user123` (ใหม่หลัง reset)

**Premium User:**
- Email: `premium@example.com`
- Username: `premiumuser`
- Password: `premium123` (ใหม่หลัง reset)

### ขั้นตอนการทดสอบ:

1. เปิด http://localhost:3000/login
2. คลิก "ลืมรหัสผ่าน?"
3. กรอก `user@example.com` (หรือ `normaluser`)
4. คลิก "ค้นหาบัญชี"
5. ตั้งรหัสผ่านใหม่เป็น `newpass123`
6. ยืนยันรหัสผ่าน `newpass123`
7. คลิก "ตั้งรหัสผ่านใหม่"
8. กลับไปหน้า login
9. Login ด้วย `user@example.com` / `newpass123`

---

## 🎨 UI/UX Features

### ✅ Responsive Design
- รองรับทุกขนาดหน้าจอ
- Card สวยงาม gradient background

### ✅ User-Friendly
- คำแนะนำชัดเจน
- Error messages ที่เข้าใจง่าย
- Loading states
- Success confirmations

### ✅ Multi-Step Process
- Step 1: ค้นหา → แสดงผล
- Step 2: ยืนยัน → ตั้งรหัสผ่าน
- ปุ่มย้อนกลับได้

### ✅ Validation
- Client-side validation
- Server-side validation
- Password strength check
- Match confirmation

---

## 🔧 Customization

### เพิ่มการส่ง Email (Production)

```typescript
// ในไฟล์ app/api/auth/forgot-password/route.ts

import { sendEmail } from '@/lib/email'

// หลังค้นหา user เจอ
await sendEmail({
  to: user.email,
  subject: 'Reset Password - MeCoins',
  body: `
    Click this link to reset your password:
    ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}
    
    This link will expire in 1 hour.
  `
})
```

### เพิ่ม Model สำหรับ Reset Token

```prisma
model PasswordReset {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id])
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  
  @@map("password_resets")
}
```

---

## 🛡️ Security Best Practices (สำหรับ Production)

### ⚠️ ระบบปัจจุบัน (Development):
- ✅ ค้นหา user ได้ทันที
- ✅ รีเซ็ตรหัสผ่านได้โดยตรง
- ⚠️ ไม่มีการยืนยันตัวตน (OTP/Email)

### ✅ ควรเพิ่มสำหรับ Production:

1. **Email Verification**
   - ส่งลิงก์รีเซ็ตทาง email
   - Token มีอายุ (1 ชั่วโมง)
   - ใช้งานได้ครั้งเดียว

2. **Rate Limiting**
   - จำกัดจำนวนครั้งการลองค้นหา
   - ป้องกัน brute force

3. **OTP/2FA**
   - ส่ง OTP ทาง SMS/Email
   - ยืนยันก่อนรีเซ็ตรหัสผ่าน

4. **Security Questions**
   - คำถามยืนยันตัวตน
   - เพิ่มชั้นความปลอดภัย

5. **Audit Log**
   - บันทึกการรีเซ็ตรหัสผ่านทั้งหมด ✅ (ทำแล้ว)
   - ติดตาม IP และ User Agent ✅ (ทำแล้ว)

---

## 🎯 Use Cases

### Case 1: ผู้ใช้ลืมรหัสผ่าน
```
1. คลิก "ลืมรหัสผ่าน" ในหน้า login
2. กรอก email หรือ username
3. ค้นพบบัญชี
4. ตั้งรหัสผ่านใหม่
5. Login ด้วยรหัสผ่านใหม่
```

### Case 2: ผู้ใช้จำ Username แต่ลืม Email
```
1. กรอก username
2. ระบบแสดง email ที่เชื่อมต่อ
3. ตั้งรหัสผ่านใหม่
```

### Case 3: ผู้ใช้มีแค่ Discord ID
```
1. กรอก Discord ID
2. ระบบหา user ที่เชื่อมต่อ
3. ตั้งรหัสผ่านใหม่
```

---

## 📝 Notes

### Current Implementation (ระบบปัจจุบัน):
- ✅ ค้นหาได้ 3 วิธี
- ✅ UI สวยงาม responsive
- ✅ Validation ครบถ้วน
- ✅ Activity logging
- ⚠️ ไม่มี email verification (เพื่อความสะดวกในการ dev)

### For Production (ควรเพิ่ม):
- 📧 Email verification
- ⏰ Token expiry
- 🔢 OTP system
- 🚫 Rate limiting
- 📊 Advanced logging

---

## 🎨 Styling

หน้า Forgot Password ใช้ design เดียวกับหน้า Login:
- Gradient background (primary-50 to primary-100)
- White card with shadow
- Responsive design
- Clear typography
- Helpful hints and examples

---

## 💻 Code Examples

### ค้นหา User
```typescript
const user = await prisma.user.findFirst({
  where: {
    OR: [
      { email: identifier },
      { username: identifier },
      { discordId: identifier },
    ],
  },
})
```

### รีเซ็ตรหัสผ่าน
```typescript
const hashedPassword = await bcrypt.hash(newPassword, 10)

await prisma.user.update({
  where: { id: userId },
  data: { password: hashedPassword },
})
```

### บันทึก Activity Log
```typescript
await ActivityLogger.logActivity({
  userId: userId,
  action: 'UPDATE',
  model: 'User',
  description: 'รีเซ็ตรหัสผ่าน',
  ipAddress: ip,
  userAgent: userAgent,
})
```

---

## 🧪 Testing

### Test Case 1: ค้นหาด้วย Email
```
Input: user@example.com
Expected: พบ user "normaluser"
```

### Test Case 2: ค้นหาด้วย Username
```
Input: normaluser
Expected: พบ user "normaluser"
```

### Test Case 3: ค้นหาด้วย Discord ID (ถ้ามี)
```
Input: 123456789
Expected: พบ user ที่เชื่อมต่อ Discord ID นี้
```

### Test Case 4: ไม่พบ User
```
Input: nonexistent@test.com
Expected: Error "ไม่พบผู้ใช้นี้ในระบบ"
```

### Test Case 5: รหัสผ่านไม่ตรงกัน
```
New Password: pass123
Confirm: pass456
Expected: Error "รหัสผ่านไม่ตรงกัน"
```

### Test Case 6: รหัสผ่านสั้นเกินไป
```
New Password: 123
Expected: Error "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
```

---

## 🎯 เส้นทางหน้าเว็บ

```
/login
  └─ "ลืมรหัสผ่าน?" ──> /forgot-password
                            │
                            ├─ Step 1: ค้นหาบัญชี
                            │   └─ กรอก identifier
                            │
                            └─ Step 2: ตั้งรหัสผ่านใหม่
                                └─ Success ──> /login
```

---

## ✅ Checklist

- [x] API ค้นหา user (3 วิธี)
- [x] API รีเซ็ตรหัสผ่าน
- [x] UI หน้า forgot-password
- [x] Form validation
- [x] Error handling
- [x] Success message
- [x] Activity logging
- [x] Link จากหน้า login
- [x] Responsive design
- [x] User-friendly messages

---

**ระบบลืมรหัสผ่านพร้อมใช้งาน! 🎉**

_Note: สำหรับ production ควรเพิ่ม email verification และ token expiry_

