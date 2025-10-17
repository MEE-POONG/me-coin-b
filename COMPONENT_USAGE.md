# 🎨 Email Test Button - Component Usage Guide

## วิธีใช้งาน EmailTestButton Component

---

## 📦 การ Import

```typescript
import EmailTestButton from '@/components/EmailTestButton'
```

---

## 🎯 การใช้งานพื้นฐาน

### ตัวอย่างที่ 1: ใช้งานแบบง่าย
```tsx
<EmailTestButton />
```

### ตัวอย่างที่ 2: กำหนด Variant
```tsx
<EmailTestButton variant="primary" />
<EmailTestButton variant="success" />
<EmailTestButton variant="danger" />
<EmailTestButton variant="secondary" />
```

### ตัวอย่างที่ 3: กำหนด CSS Class
```tsx
<EmailTestButton className="text-lg px-8 py-4" />
<EmailTestButton className="w-full" />
```

---

## 🎨 Variants Available

| Variant | สี | ใช้เมื่อ |
|---------|---|---------|
| `primary` | Blue | ใช้งานทั่วไป (default) |
| `success` | Green | แสดงการทำงานสำเร็จ |
| `danger` | Red | แสดงคำเตือน |
| `secondary` | Gray | ใช้เป็นปุ่มรอง |

---

## 📍 ตำแหน่งที่ใช้งานแล้ว

### 1. Admin Dashboard (`/admin`)
```tsx
<div className="flex justify-between items-center mb-8">
  <h1>แดชบอร์ดแอดมิน</h1>
  <EmailTestButton variant="primary" />
</div>
```

### 2. Test Email Page (`/test-email`)
```tsx
<EmailTestButton className="text-lg px-8 py-4" />
```

---

## ✨ Features

### 📧 6 Email Templates พร้อมส่ง:
1. **Welcome Email** - ต้อนรับสมาชิกใหม่
2. **Reset Password** - ลืมรหัสผ่าน
3. **Deposit Approved** - อนุมัติฝากเงิน
4. **Deposit Rejected** - ปฏิเสธฝากเงิน
5. **Withdrawal Approved** - อนุมัติถอนเงิน
6. **Transaction Notification** - แจ้งเตือนธุรกรรม

### 🎨 UI Features:
- ✅ Modal popup สวยงาม
- ✅ กรอก email ปลายทางได้
- ✅ แสดงผลลัพธ์การส่ง
- ✅ Loading state
- ✅ Error handling
- ✅ Responsive design

---

## 🔌 API Endpoint

Component นี้ใช้ API:
```
POST /api/test/send-email
```

**Request:**
```json
{
  "to": "test@example.com",
  "template": "welcome"
}
```

**Template Types:**
- `welcome`
- `reset-password`
- `deposit-approved`
- `deposit-rejected`
- `withdrawal-approved`
- `transaction`

---

## 💡 ตัวอย่างการใช้งานในหน้าต่างๆ

### ใน Dashboard Page
```tsx
export default function DashboardPage() {
  return (
    <div>
      <div className="flex justify-between">
        <h1>Dashboard</h1>
        <EmailTestButton />
      </div>
      {/* content */}
    </div>
  )
}
```

### ใน Settings Page
```tsx
<div className="bg-white p-6 rounded-lg">
  <h2>Email Settings</h2>
  <EmailTestButton variant="success" className="mt-4" />
</div>
```

### ใน Header/Navbar
```tsx
<nav>
  <div className="flex items-center gap-4">
    <span>Admin</span>
    <EmailTestButton variant="secondary" />
  </div>
</nav>
```

---

## 🎯 หน้าทดสอบ Email เฉพาะ

เข้าได้ที่: **`/test-email`**

Features:
- ✅ แสดงการตั้งค่า Gmail
- ✅ ปุ่มทดสอบทุก template
- ✅ คู่มือ Quick Setup
- ✅ Tips และคำแนะนำ

**ใช้ได้ทุกคน** (ไม่ต้อง login) หรือเพิ่มเข้า Admin menu

---

## 🔒 Permission

Component นี้ใช้งานได้โดยไม่ต้อง authentication แต่ควร:
- ใส่ในหน้า Admin เท่านั้น
- หรือเพิ่มการตรวจสอบสิทธิ์ใน API

**การเพิ่มการตรวจสอบสิทธิ์:**
```typescript
// ใน app/api/test/send-email/route.ts
const session = await getServerSession(authOptions)

if (!session?.user?.id || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## 📊 การทำงาน

```
User clicks button
  ↓
Modal opens
  ↓
User inputs email address
  ↓
User selects template
  ↓
API call to /api/test/send-email
  ↓
Backend sends email via Gmail SMTP
  ↓
Shows success/error message
```

---

## 🎨 Customization

### เปลี่ยนสี Variant
```tsx
// แก้ไขใน components/EmailTestButton.tsx
const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700',
  custom: 'bg-pink-600 hover:bg-pink-700',
}
```

### เพิ่ม Email Template ใหม่
```tsx
// เพิ่มปุ่มใน Modal
<button
  onClick={() => handleSendTestEmail('custom-template')}
  className="w-full bg-gradient-to-r from-pink-500 to-pink-700..."
>
  🌟 Custom Template
</button>
```

```typescript
// เพิ่ม case ใน API
case 'custom-template':
  emailTemplate = EmailTemplates.customTemplate(...)
  break
```

---

## 🧪 การทดสอบ

### วิธีที่ 1: ใช้ Component ในหน้า Admin
1. Login เป็น Admin
2. ไปที่ `/admin`
3. คลิกปุ่ม "📧 ทดสอบ Email" มุมขวาบน
4. เลือก template
5. คลิกส่ง
6. เช็ค email

### วิธีที่ 2: ใช้หน้า Test Email
1. ไปที่ `/test-email`
2. คลิกปุ่ม "📧 ทดสอบส่ง Email"
3. เลือก template
4. คลิกส่ง
5. เช็ค email

### วิธีที่ 3: Import ใช้ที่ไหนก็ได้
```tsx
import EmailTestButton from '@/components/EmailTestButton'

<EmailTestButton variant="success" />
```

---

## ✅ สิ่งที่สร้างให้แล้ว:

1. **Component**: `components/EmailTestButton.tsx`
   - ปุ่มพร้อม Modal
   - 6 email templates
   - Input email address
   - Result display

2. **API**: `app/api/test/send-email/route.ts`
   - รับ request จาก client
   - ส่ง email ผ่าน Gmail SMTP
   - รองรับ 6 templates

3. **Page**: `app/test-email/page.tsx`
   - หน้าทดสอบ email เต็มรูปแบบ
   - คู่มือ Quick Setup
   - แสดงข้อมูลการตั้งค่า

4. **Menu**: เพิ่มใน Admin Layout
   - เมนู "ทดสอบ Email" ใน sidebar

---

## 🎯 ตอนนี้สามารถ:

✅ คลิกปุ่มทดสอบส่ง email ได้ทุกที่  
✅ ไม่ต้องใช้ terminal  
✅ เห็นผลลัพธ์ทันที  
✅ เปลี่ยน email ปลายทางได้  
✅ ทดสอบได้ทุก template  

---

**ลองใช้งานได้เลยค่ะ! เพียงรัน `npm run dev` และไปที่:**
- `/admin` - ดูปุ่มที่มุมขวาบน
- `/test-email` - หน้าทดสอบเต็มรูปแบบ

หรือ import `<EmailTestButton />` ไปใช้ที่ไหนก็ได้! 🎉

