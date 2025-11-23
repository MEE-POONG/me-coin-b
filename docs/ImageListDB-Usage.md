# ImageListDB - คู่มือการใช้งาน 📚

`ImageListDB` เป็น class สำหรับจัดการรูปภาพในระบบ รองรับทั้งการเก็บข้อมูลใน database และการอัพโหลดไป Cloudflare Images

## 🚀 การติดตั้งและใช้งาน

```typescript
import ImageListDB, { ImageListUtils } from '@/lib/ImageListDB';
```

## 📋 Basic Operations

### 1. ดึงรายการรูปภาพ
```typescript
// ดึงรายการทั้งหมด (มี pagination)
const result = await ImageListDB.list({
  page: 1,
  pageSize: 10,
  keyword: 'ค้นหา',
  modalName: 'deposit',
  createdBy: 'admin',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

console.log(result.data); // รายการรูปภาพ
console.log(result.pagination); // ข้อมูล pagination
```

### 2. ค้นหารูปภาพ
```typescript
// ค้นหาด้วย keyword
const searchResult = await ImageListDB.search('slip payment', {
  page: 1,
  pageSize: 20
});

// ค้นหาตาม modalName
const depositImages = await ImageListDB.getByModalName('deposit', 10);

// ค้นหาตาม createdBy
const userImages = await ImageListDB.getByCreatedBy('user123', 5);
```

### 3. ดึงรูปภาพตาม ID
```typescript
const image = await ImageListDB.getById('image-id-123');
if (image) {
  console.log(image.nameFile);
  console.log(image.imageUrl);
}
```

## ➕ การเพิ่มรูปภาพ

### วิธีที่ 1: บันทึกข้อมูลอย่างเดียว
```typescript
const newImage = await ImageListDB.create({
  imageUrl: 'https://example.com/image.jpg',
  nameFile: 'payment-slip.jpg',
  modalName: 'deposit',
  createdBy: 'user123'
});
```

### วิธีที่ 2: อัพโหลดและบันทึกในครั้งเดียว ⭐
```typescript
// สำหรับ File object (จาก frontend)
const file = event.target.files[0];
const result = await ImageListDB.uploadAndSave(file, {
  nameFile: 'slip-123.jpg',
  modalName: 'deposit',
  createdBy: 'user456'
});

if (result.success) {
  console.log('อัพโหลดสำเร็จ!', result.image);
} else {
  console.error('เกิดข้อผิดพลาด:', result.error);
}
```

## ✏️ การแก้ไขและลบ

### แก้ไขรูปภาพ
```typescript
const updatedImage = await ImageListDB.update('image-id-123', {
  nameFile: 'new-filename.jpg',
  modalName: 'withdrawal',
  updatedBy: 'admin'
});
```

### ลบรูปภาพ
```typescript
// Soft delete (แนะนำ)
await ImageListDB.softDelete('image-id-123', 'admin');

// Hard delete (ลบถาวร)
await ImageListDB.hardDelete('image-id-123');

// Bulk delete (ลบหลายอัน)
const deletedCount = await ImageListDB.bulkDelete([
  'id1', 'id2', 'id3'
], 'admin');
```

### กู้คืนรูปภาพ
```typescript
// กู้คืนรูปเดียว
const restoredImage = await ImageListDB.restore('image-id-123');

// กู้คืนหลายรูป
const restoredCount = await ImageListDB.bulkRestore([
  'id1', 'id2', 'id3'
]);
```

## 📊 สถิติและข้อมูล

### ดึงสถิติ
```typescript
const stats = await ImageListDB.getStats();
console.log(stats);
// {
//   total: 150,
//   active: 130,
//   deleted: 20,
//   deletedPercentage: 13
// }
```

### ค้นหาตามช่วงวันที่
```typescript
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-12-31');
const images = await ImageListDB.getByDateRange(startDate, endDate);
```

## 🛠️ Utility Functions

### จัดการ Cloudflare Images URLs
```typescript
const originalUrl = 'https://imagedelivery.net/hash/id/public';

// เปลี่ยน variant
const thumbnailUrl = ImageListUtils.getVariantUrl(originalUrl, 'thumbnail');
const smallUrl = ImageListUtils.getVariantUrl(originalUrl, 'small');

// กำหนดขนาดเฉพาะ
const resizedUrl = ImageListUtils.getResizedUrl(originalUrl, 300, 200);
const squareUrl = ImageListUtils.getResizedUrl(originalUrl, 150); // 150x150
```

### อื่นๆ
```typescript
// ตรวจสอบ URL
const isValid = ImageListUtils.isValidImageUrl('https://example.com/image.jpg');

// สร้างชื่อไฟล์ที่ unique
const uniqueName = ImageListUtils.generateUniqueFilename('original.jpg');
// ผลลัพธ์: "original_1640995200000_abc123.jpg"
```

## 🌐 API Endpoints

### REST API ที่พร้อมใช้งาน:

```bash
# ดึงรายการ
GET /api/images?page=1&pageSize=10&keyword=search

# ค้นหา
GET /api/images/search?keyword=slip&modalName=deposit

# ดึงตาม ID
GET /api/images/[id]

# เพิ่มรูปภาพ
POST /api/images
{
  "imageUrl": "https://...",
  "nameFile": "image.jpg",
  "modalName": "deposit"
}

# อัพโหลดและบันทึกในครั้งเดียว
POST /api/images/upload-and-save
FormData: { file, nameFile, modalName, createdBy }

# แก้ไข
PUT /api/images/[id]
{
  "nameFile": "new-name.jpg",
  "updatedBy": "admin"
}

# ลบ (soft delete)
DELETE /api/images/[id]

# ลบถาวร
DELETE /api/images/[id]?hard=true

# กู้คืน
PUT /api/images/restore?id=123

# สถิติ
GET /api/images/stats
```

## 💡 ตัวอย่างการใช้งานจริง

### Frontend Upload Component
```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('nameFile', file.name);
  formData.append('modalName', 'deposit');
  formData.append('createdBy', currentUser.id);

  try {
    const response = await fetch('/api/images/upload-and-save', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('อัพโหลดสำเร็จ:', result.data);
      // อัพเดต UI
    }
  } catch (error) {
    console.error('อัพโหลดล้มเหลว:', error);
  }
};
```

### Image Gallery Component
```typescript
const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [pagination, setPagination] = useState(null);

  const fetchImages = async (page = 1) => {
    const response = await fetch(`/api/images?page=${page}&pageSize=12`);
    const data = await response.json();
    
    if (data.success) {
      setImages(data.data);
      setPagination(data.pagination);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map(image => (
        <img 
          key={image.id}
          src={ImageListUtils.getVariantUrl(image.imageUrl, 'small')}
          alt={image.nameFile}
          className="w-full h-32 object-cover rounded"
        />
      ))}
    </div>
  );
};
```

## 🔒 Security & Best Practices

1. **ตรวจสอบ permissions** ก่อน delete/update
2. **ใช้ soft delete** เป็นหลัก เก็บ hard delete ไว้สำหรับ admin เท่านั้น
3. **Validate file types** ก่อนอัพโหลด
4. **จำกัดขนาดไฟล์** (ปัจจุบัน: 10MB)
5. **ใช้ pagination** เสมอเพื่อประสิทธิภาพ

## 🚨 Error Handling

```typescript
try {
  const result = await ImageListDB.uploadAndSave(file, data);
  
  if (!result.success) {
    // จัดการ error
    switch (result.error) {
      case 'Upload failed':
        alert('การอัพโหลดล้มเหลว กรุณาลองใหม่');
        break;
      case 'Save error':
        alert('ไม่สามารถบันทึกข้อมูลได้');
        break;
      default:
        alert('เกิดข้อผิดพลาด: ' + result.error);
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
  alert('เกิดข้อผิดพลาดที่ไม่คาดคิด');
}
```

---

## 📞 ช่วยเหลือเพิ่มเติม

หากมีคำถาม หรือต้องการ feature เพิ่มเติม สามารถปรับแต่ง `ImageListDB` class ได้ตามต้องการ! 🚀
