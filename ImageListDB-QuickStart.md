# 🚀 ImageListDB - Quick Start Guide

เริ่มใช้งาน ImageListDB ได้ใน 5 นาที!

## 📦 Installation

```bash
# ไฟล์หลักอยู่ที่
lib/ImageListDB.ts

# API routes อยู่ที่
app/api/images/
```

## ⚡ การใช้งานพื้นฐาน

### 1. Import
```typescript
import ImageListDB, { ImageListUtils } from '@/lib/ImageListDB';
```

### 2. อัพโหลดรูป + บันทึก (แนะนำ) ⭐
```typescript
// Frontend
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('nameFile', file.name);
  formData.append('modalName', 'deposit');
  formData.append('createdBy', 'user123');

  const response = await fetch('/api/images/upload-and-save', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('อัพโหลดสำเร็จ!', result.data);
  }
};

// หรือใช้ใน Backend
const result = await ImageListDB.uploadAndSave(file, {
  nameFile: 'slip.jpg',
  modalName: 'deposit',
  createdBy: 'user123'
});
```

### 3. ดึงรายการรูปภาพ
```typescript
// แบบง่าย
const images = await ImageListDB.list();

// แบบละเอียด
const result = await ImageListDB.list({
  page: 1,
  pageSize: 10,
  keyword: 'slip',
  modalName: 'deposit'
});
```

### 4. จัดการ URL รูปภาพ
```typescript
const originalUrl = 'https://imagedelivery.net/hash/id/public';

// ขนาดต่างๆ
const thumb = ImageListUtils.getVariantUrl(originalUrl, 'thumbnail');
const small = ImageListUtils.getVariantUrl(originalUrl, 'small');

// ขนาดกำหนดเอง
const avatar = ImageListUtils.getResizedUrl(originalUrl, 100); // 100x100
const banner = ImageListUtils.getResizedUrl(originalUrl, 800, 200);
```

## 🎯 Use Cases

### Image Gallery
```typescript
const ImageGallery = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    ImageListDB.list({ pageSize: 20 }).then(result => {
      setImages(result.data);
    });
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map(img => (
        <img 
          key={img.id}
          src={ImageListUtils.getVariantUrl(img.imageUrl, 'small')}
          alt={img.nameFile}
          className="w-full h-32 object-cover rounded"
        />
      ))}
    </div>
  );
};
```

### File Upload Component
```typescript
const FileUploader = ({ onUploaded }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    const result = await ImageListDB.uploadAndSave(file, {
      nameFile: file.name,
      modalName: 'gallery',
      createdBy: 'current-user'
    });

    if (result.success) {
      onUploaded(result.image);
    } else {
      alert('Upload failed: ' + result.error);
    }
    
    setUploading(false);
  };

  return (
    <input 
      type="file" 
      onChange={handleFileChange} 
      disabled={uploading}
      accept="image/*"
    />
  );
};
```

## 🌐 REST API

```bash
# ดึงรายการ
GET /api/images?page=1&pageSize=10

# ค้นหา
GET /api/images/search?keyword=slip

# อัพโหลด + บันทึก
POST /api/images/upload-and-save
# FormData: file, nameFile, modalName, createdBy

# ดึงตาม ID
GET /api/images/[id]

# แก้ไข
PUT /api/images/[id]

# ลบ
DELETE /api/images/[id]

# สถิติ
GET /api/images/stats
```

## 💡 Tips

1. **ใช้ `uploadAndSave()` เป็นหลัก** - ทำทุกอย่างในขั้นตอนเดียว
2. **ใช้ `getVariantUrl()`** - ประหยัด bandwidth
3. **ใช้ soft delete** - `softDelete()` แทน `hardDelete()`
4. **กำหนด modalName** - เพื่อจัดหมวดหมู่รูปภาพ
5. **ใช้ pagination** - เสมอในการแสดงรายการ

## 📞 Help

- 📖 ดู [docs/ImageListDB-Usage.md](docs/ImageListDB-Usage.md) สำหรับรายละเอียดครบถ้วน
- 🧪 ดู [examples/ImageListDB-Examples.ts](examples/ImageListDB-Examples.ts) สำหรับตัวอย่างครบชุด

---

เท่านี้ก็พร้อมใช้งาน ImageListDB แล้ว! 🎉
