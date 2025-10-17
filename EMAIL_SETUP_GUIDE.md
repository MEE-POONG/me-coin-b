# 📧 Email Setup Guide - MeCoins

## การตั้งค่า Gmail SMTP สำหรับส่ง Email

---

## 🎯 ภาพรวม

ระบบ MeCoins ใช้ **Gmail SMTP** ผ่าน Nodemailer เพื่อส่ง email ให้ลูกค้าในกรณีต่างๆ:

1. ✅ Reset Password (ลืมรหัสผ่าน)
2. ✅ Deposit Approved (อนุมัติฝากเงิน)
3. ✅ Deposit Rejected (ปฏิเสธฝากเงิน)
4. ✅ Withdrawal Approved (อนุมัติถอนเงิน)
5. ✅ Welcome Email (ต้อนรับสมาชิกใหม่)
6. ✅ Transaction Notification (แจ้งเตือนธุรกรรม)

---

## 🔧 ขั้นตอนการตั้งค่า Gmail

### Step 1: เปิดใช้งาน 2-Factor Authentication

1. ไปที่ [Google Account Security](https://myaccount.google.com/security)
2. เลือก "2-Step Verification"
3. ทำตามขั้นตอนเพื่อเปิดใช้งาน

---

### Step 2: สร้าง App Password

1. ไปที่ [Google Account](https://myaccount.google.com/)
2. เลือก "Security" (ความปลอดภัย)
3. ใน "How you sign in to Google" หา "2-Step Verification"
4. เลื่อนลงล่างหา **"App passwords"**
5. คลิก "App passwords"
6. เลือก:
   - **App**: Mail
   - **Device**: Other (Custom name)
7. ใส่ชื่อ: "MeCoins Server"
8. คลิก "Generate"
9. **คัดลอก password ที่แสดง** (16 ตัวอักษร)

**ตัวอย่าง App Password:**
```
abcd efgh ijkl mnop
```

---

### Step 3: ตั้งค่า Environment Variables

แก้ไขไฟล์ `.env`:

```env
# Email Configuration
EMAIL_USER="me.prompt.tec@gmail.com"
EMAIL_PASSWORD="abcdefghijklmnop"  # App Password ที่ได้จาก Step 2 (ไม่ต้องมีเว้นวรรค)
```

**⚠️ สำคัญ:**
- ใช้ **App Password** ไม่ใช่รหัสผ่าน Gmail ปกติ
- ลบเว้นวรรคออกจาก App Password
- อย่า commit .env เข้า Git

---

### Step 4: ทดสอบการส่ง Email

สร้างไฟล์ `scripts/test-email.ts`:

```typescript
import { sendEmail, EmailTemplates } from '../lib/email'

async function testEmail() {
  try {
    const template = EmailTemplates.welcome('TestUser', 'test@example.com')
    
    const result = await sendEmail({
      to: 'recipient@example.com', // เปลี่ยนเป็น email ของคุณ
      subject: template.subject,
      html: template.html,
    })

    if (result.success) {
      console.log('✅ Email sent successfully!')
    } else {
      console.log('❌ Failed to send email')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

testEmail()
```

รัน:
```bash
npx ts-node scripts/test-email.ts
```

---

## 📧 Email Templates ทั้งหมด

### 1. Reset Password Email
```typescript
import { sendEmail, EmailTemplates } from '@/lib/email'

const template = EmailTemplates.resetPassword(
  username,
  `${process.env.NEXTAUTH_URL}/forgot-password?token=${token}`
)

await sendEmail({
  to: user.email,
  ...template,
})
```

### 2. Deposit Approved Email
```typescript
const template = EmailTemplates.depositApproved(
  user.username,
  deposit.amount,
  wallet.balance
)

await sendEmail({
  to: user.email,
  ...template,
})
```

### 3. Deposit Rejected Email
```typescript
const template = EmailTemplates.depositRejected(
  user.username,
  deposit.amount,
  deposit.comment // เหตุผล
)

await sendEmail({
  to: user.email,
  ...template,
})
```

### 4. Withdrawal Approved Email
```typescript
const template = EmailTemplates.withdrawalApproved(
  user.username,
  withdrawal.amount,
  wallet.balance
)

await sendEmail({
  to: user.email,
  ...template,
})
```

### 5. Welcome Email
```typescript
const template = EmailTemplates.welcome(
  user.username,
  user.email
)

await sendEmail({
  to: user.email,
  ...template,
})
```

### 6. Transaction Notification
```typescript
const template = EmailTemplates.transaction(
  user.username,
  'DEPOSIT', // or 'WITHDRAWAL', 'PURCHASE', etc.
  amount,
  balance
)

await sendEmail({
  to: user.email,
  ...template,
})
```

---

## 🔌 การเพิ่ม Email ใน API

### ตัวอย่าง: ส่ง Email เมื่อ Deposit Approved

แก้ไข `app/api/deposits/[id]/route.ts`:

```typescript
import { sendEmail, EmailTemplates } from '@/lib/email'

// หลังจาก approve deposit
if (status === 'APPROVED') {
  // ... update wallet และ transaction ...
  
  // ส่ง email
  const updatedWallet = await prisma.wallet.findUnique({
    where: { userId: deposit.userId },
  })
  
  const template = EmailTemplates.depositApproved(
    deposit.user.username,
    deposit.amount * deposit.rate,
    updatedWallet?.balance || 0
  )
  
  await sendEmail({
    to: deposit.user.email,
    ...template,
  })
}
```

---

## 🚨 Troubleshooting

### ปัญหา: Error: Invalid login

**สาเหตุ:**
- ใช้รหัสผ่าน Gmail ปกติแทน App Password
- App Password ไม่ถูกต้อง
- ยังไม่เปิด 2FA

**วิธีแก้:**
1. ตรวจสอบว่าเปิด 2FA แล้ว
2. สร้าง App Password ใหม่
3. คัดลอก App Password อย่างถูกต้อง (ไม่มีเว้นวรรค)

---

### ปัญหา: Error: Connection timeout

**สาเหตุ:**
- Firewall block port 587 หรือ 465
- Network ไม่อนุญาตให้เชื่อมต่อ SMTP

**วิธีแก้:**
```typescript
// ลองเปลี่ยน config
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true สำหรับ 465, false สำหรับ 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})
```

---

### ปัญหา: Email ไปอยู่ใน Spam

**วิธีแก้:**
1. เพิ่ม SPF record ใน domain
2. ใช้ verified sender address
3. หลีกเลี่ยง spam keywords
4. ทดสอบส่งหาตัวเองก่อน

---

## 🎨 Customization

### เปลี่ยน Email Sender Name
```typescript
// ใน lib/email.ts
from: `"MeCoins - ระบบเติมเครดิต" <${process.env.EMAIL_USER}>`,
```

### เพิ่ม Email Template ใหม่
```typescript
// ใน lib/email.ts - EmailTemplates
export const EmailTemplates = {
  // ... existing templates ...
  
  customNotification: (username: string, message: string) => ({
    subject: '🔔 แจ้งเตือน - MeCoins',
    html: `
      <div style="...">
        <p>สวัสดีคุณ ${username},</p>
        <p>${message}</p>
      </div>
    `,
  }),
}
```

---

## 📊 Email Tracking (Optional)

### เพิ่ม Model สำหรับติดตาม Email

```prisma
model EmailLog {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id])
  to        String
  subject   String
  type      String   // "RESET_PASSWORD", "DEPOSIT_APPROVED", etc.
  sent      Boolean  @default(false)
  sentAt    DateTime?
  error     String?
  createdAt DateTime @default(now())
  
  @@map("email_logs")
}
```

---

## 🔒 Security Best Practices

### ✅ Do's:
1. ใช้ App Password (ไม่ใช่รหัสผ่านจริง)
2. เก็บ credentials ใน .env
3. เพิ่ม .env ใน .gitignore
4. ใช้ HTTPS ใน production
5. Validate email addresses

### ❌ Don'ts:
1. อย่า commit EMAIL_PASSWORD เข้า Git
2. อย่าใช้รหัสผ่าน Gmail ปกติ
3. อย่าส่ง email บ่อยเกินไป (rate limit)
4. อย่า hardcode email addresses

---

## 📈 Rate Limiting

Gmail SMTP มีขอบเขต:
- **ฟรี**: 500 emails/day
- **Google Workspace**: 2,000 emails/day

ถ้าต้องการส่งมากกว่านี้ ควรใช้:
- SendGrid
- AWS SES
- Mailgun
- Postmark

---

## 🎯 Next Steps

### 1. ตั้งค่า Gmail App Password
```bash
# ทำตาม Step 1-2 ข้างบน
```

### 2. อัปเดต .env
```env
EMAIL_USER="me.prompt.tec@gmail.com"
EMAIL_PASSWORD="your-app-password-here"
```

### 3. ติดตั้ง nodemailer
```bash
npm install
```

### 4. ทดสอบส่ง Email
```bash
npx ts-node scripts/test-email.ts
```

### 5. เพิ่มการส่ง Email ใน API
- Forgot Password ✅ (พร้อมแล้ว)
- Deposit Approved ✨ (ต้องเพิ่ม)
- Withdrawal Approved ✨ (ต้องเพิ่ม)

---

## 💡 Tips

1. **ทดสอบก่อนใช้จริง**: ส่งหาตัวเองก่อน
2. **ตรวจสอบ Spam folder**: Email อาจไปอยู่ใน spam
3. **ใช้ HTML Templates**: สวยงามและ professional
4. **Log ทุกการส่ง**: เพื่อ debug ง่าย
5. **Handle errors**: อย่าให้ email failure ทำให้ระบบล่ม

---

## 📚 Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)

---

**พร้อมส่ง Email แล้ว! 📧**

