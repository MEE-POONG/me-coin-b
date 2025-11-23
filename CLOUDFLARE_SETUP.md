# 🚀 Cloudflare Images Setup Guide

## 📋 Environment Variables ที่ต้องตั้งค่า

สร้างไฟล์ `.env.local` ใน root directory และเพิ่ม:

```bash
# Cloudflare Account ID
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# Cloudflare API Token  
CLOUDFLARE_API_TOKEN=your_api_token_here

# Cloudflare Images Hash
CFIMG=your_images_hash_here

# Cloudflare API Key (optional)
CLOUDFLARE_KEY=your_api_key_here
```

## 🔍 วิธีหาค่าต่างๆ:

### 1. **CLOUDFLARE_ACCOUNT_ID**
1. เข้า [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. ขวามือจะเห็น **Account ID** 
3. คัดลอกมาใส่

### 2. **CLOUDFLARE_API_TOKEN**
1. เข้า Cloudflare Dashboard → **My Profile** (มุมขวาบน)
2. เลือก **API Tokens** tab
3. คลิก **Create Token**
4. เลือก **Custom token**
5. ตั้งค่า Permissions:
   - **Account** → Cloudflare Images → **Edit**
   - **Zone Resources** → Include → **All zones** (หรือ specific zone)
6. คลิก **Continue to summary** → **Create Token**
7. คัดลอก Token มาใส่

### 3. **CFIMG**
1. เข้า Cloudflare Dashboard → **Images**
2. ดู **Developer Resources** ด้านล่าง
3. จะเห็น URL แบบนี้: `https://imagedelivery.net/{HASH}/`
4. คัดลอกส่วน `{HASH}` มาใส่

## 🧪 ทดสอบการตั้งค่า

### 1. เช็ค Environment Variables:
```
GET http://localhost:3000/api/test-env
```

### 2. ทดสอบอัพโหลด:
```bash
curl -X POST http://localhost:3000/api/upload/cloudflare \
  -F "file=@test-image.jpg"
```

## 🚨 Troubleshooting

### ❌ "Failed to parse URL from /api/upload/cloudflare"
- **สาเหตุ**: Environment variables ไม่ได้ตั้งค่า
- **วิธีแก้**: ตั้งค่า CLOUDFLARE_ACCOUNT_ID และ CLOUDFLARE_API_TOKEN

### ❌ "Cloudflare credentials not configured"  
- **สาเหตุ**: `.env.local` ไม่มีหรือค่าผิด
- **วิธีแก้**: สร้างไฟล์ `.env.local` ใหม่

### ❌ "Unauthorized" หรือ "403"
- **สาเหตุ**: API Token ผิดหรือไม่มี permission
- **วิธีแก้**: สร้าง API Token ใหม่ด้วย permission ที่ถูกต้อง

### ❌ "Account not found"
- **สาเหตุ**: CLOUDFLARE_ACCOUNT_ID ผิด  
- **วิธีแก้**: เช็ค Account ID ใหม่

## ✅ การใช้งานหลังตั้งค่าเรียบร้อย

หลังจากตั้งค่าครบแล้ว:
1. **Restart development server**: `npm run dev`
2. **ทดสอบอัพโหลด** ในหน้า Deposit
3. **เช็คผลลัพธ์** ที่ Cloudflare Images Dashboard

---

## 🆘 ต้องการความช่วยเหลือ?

หากยังมีปัญหา ให้:
1. เช็ค `http://localhost:3000/api/test-env` ก่อน
2. ดู console logs เพื่อหา error details
3. ตรวจสอบ Cloudflare API Token permissions
