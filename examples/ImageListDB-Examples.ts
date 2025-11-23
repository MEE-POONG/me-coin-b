// ======================================
// 🎯 ตัวอย่างการใช้งาน ImageListDB
// ======================================

import ImageListDB, { ImageListUtils } from '@/lib/ImageListDB';

// ======================================
// 📋 1. Basic CRUD Operations
// ======================================

export async function basicOperationsExample() {
  console.log('🚀 Basic Operations Example');
  
  // 1.1 สร้างรูปภาพใหม่
  const newImage = await ImageListDB.create({
    imageUrl: 'https://example.com/slip.jpg',
    nameFile: 'payment-slip-001.jpg',
    modalName: 'deposit',
    createdBy: 'user123'
  });
  console.log('✅ Created:', newImage);

  // 1.2 ดึงรูปภาพตาม ID
  const fetchedImage = await ImageListDB.getById(newImage.id);
  console.log('👁️ Fetched:', fetchedImage);

  // 1.3 แก้ไขรูปภาพ
  const updatedImage = await ImageListDB.update(newImage.id, {
    nameFile: 'updated-slip-001.jpg',
    modalName: 'deposit-approved',
    updatedBy: 'admin'
  });
  console.log('✏️ Updated:', updatedImage);

  // 1.4 ลบรูปภาพ (soft delete)
  await ImageListDB.softDelete(newImage.id, 'admin');
  console.log('🗑️ Soft deleted');

  // 1.5 กู้คืนรูปภาพ
  const restoredImage = await ImageListDB.restore(newImage.id);
  console.log('🔄 Restored:', restoredImage);
}

// ======================================
// 🔍 2. Search and Filtering
// ======================================

export async function searchExample() {
  console.log('🔍 Search Example');

  // 2.1 ค้นหาทั่วไป
  const searchResult = await ImageListDB.search('slip', {
    page: 1,
    pageSize: 10,
    modalName: 'deposit',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  console.log('🔍 Search results:', searchResult);

  // 2.2 ดึงตาม modalName
  const depositImages = await ImageListDB.getByModalName('deposit', 5);
  console.log('🏷️ Deposit images:', depositImages);

  // 2.3 ดึงตาม createdBy
  const userImages = await ImageListDB.getByCreatedBy('user123', 10);
  console.log('👤 User images:', userImages);

  // 2.4 ค้นหาตามช่วงวันที่
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');
  const dateRangeImages = await ImageListDB.getByDateRange(startDate, endDate);
  console.log('📅 Date range images:', dateRangeImages);
}

// ======================================
// 📊 3. Statistics and Analytics
// ======================================

export async function statisticsExample() {
  console.log('📊 Statistics Example');

  // 3.1 ดึงสถิติทั่วไป
  const stats = await ImageListDB.getStats();
  console.log('📊 Stats:', stats);
  // Output: { total: 100, active: 85, deleted: 15, deletedPercentage: 15 }

  // 3.2 วิเคราะห์การใช้งาน
  const recentImages = await ImageListDB.list({
    page: 1,
    pageSize: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // นับจำนวนตาม modalName
  const modalStats = recentImages.data.reduce((acc, img) => {
    const modal = img.modalName || 'unknown';
    acc[modal] = (acc[modal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📈 Modal usage stats:', modalStats);
  // Output: { deposit: 25, withdrawal: 15, profile: 10 }
}

// ======================================
// ☁️ 4. Cloudflare Integration
// ======================================

export async function cloudflareExample() {
  console.log('☁️ Cloudflare Integration Example');

  // 4.1 อัพโหลดไฟล์ไป Cloudflare (จำลอง)
  const mockFile = new File(['mock content'], 'test.jpg', { type: 'image/jpeg' });
  
  // ในการใช้งานจริง จะได้รับ file จาก input
  // const file = event.target.files[0];
  
  const uploadResult = await ImageListDB.uploadAndSave(mockFile, {
    nameFile: 'cloudflare-test.jpg',
    modalName: 'test',
    createdBy: 'system'
  });

  if (uploadResult.success && uploadResult.image) {
    console.log('☁️ Upload successful:', uploadResult.image);
    
    // 4.2 สร้าง URLs ในรูปแบบต่างๆ
    const originalUrl = uploadResult.image.imageUrl;
    
    const thumbnailUrl = ImageListUtils.getVariantUrl(originalUrl, 'thumbnail');
    const smallUrl = ImageListUtils.getVariantUrl(originalUrl, 'small');
    const mediumUrl = ImageListUtils.getVariantUrl(originalUrl, 'medium');
    
    console.log('🖼️ Image variants:', {
      original: originalUrl,
      thumbnail: thumbnailUrl,
      small: smallUrl,
      medium: mediumUrl
    });

    // 4.3 สร้าง custom sizes
    const avatar100 = ImageListUtils.getResizedUrl(originalUrl, 100);
    const banner800x200 = ImageListUtils.getResizedUrl(originalUrl, 800, 200);
    
    console.log('📏 Custom sizes:', {
      avatar: avatar100,
      banner: banner800x200
    });
  } else {
    console.error('❌ Upload failed:', uploadResult.error);
  }
}

// ======================================
// 🔄 5. Bulk Operations
// ======================================

export async function bulkOperationsExample() {
  console.log('🔄 Bulk Operations Example');

  // 5.1 สร้างรูปภาพหลายรูปเพื่อทดสอบ
  const testImages = await Promise.all([
    ImageListDB.create({
      imageUrl: 'https://example.com/bulk1.jpg',
      nameFile: 'bulk-test-1.jpg',
      modalName: 'test-bulk',
      createdBy: 'system'
    }),
    ImageListDB.create({
      imageUrl: 'https://example.com/bulk2.jpg',
      nameFile: 'bulk-test-2.jpg',
      modalName: 'test-bulk',
      createdBy: 'system'
    }),
    ImageListDB.create({
      imageUrl: 'https://example.com/bulk3.jpg',
      nameFile: 'bulk-test-3.jpg',
      modalName: 'test-bulk',
      createdBy: 'system'
    })
  ]);

  const imageIds = testImages.map(img => img.id);
  console.log('✨ Created test images:', imageIds);

  // 5.2 Bulk delete
  const deletedCount = await ImageListDB.bulkDelete(imageIds, 'system');
  console.log(`🗑️ Bulk deleted ${deletedCount} images`);

  // 5.3 Bulk restore
  const restoredCount = await ImageListDB.bulkRestore(imageIds);
  console.log(`🔄 Bulk restored ${restoredCount} images`);

  // 5.4 Cleanup (hard delete)
  await Promise.all(imageIds.map(id => ImageListDB.hardDelete(id)));
  console.log('🧹 Cleanup completed');
}

// ======================================
// 🎯 6. Real-world Use Cases
// ======================================

export async function realWorldUseCases() {
  console.log('🎯 Real-world Use Cases');

  // 6.1 Use Case: จัดการสลิปการโอนเงิน
  async function managePaymentSlips(userId: string, files: File[]) {
    const results = [];
    
    for (const file of files) {
      const uniqueName = ImageListUtils.generateUniqueFilename(file.name);
      
      const result = await ImageListDB.uploadAndSave(file, {
        nameFile: uniqueName,
        modalName: 'payment-slip',
        createdBy: userId
      });
      
      results.push(result);
    }
    
    return results;
  }

  // 6.2 Use Case: สร้าง Gallery สำหรับ Admin
  async function createAdminGallery(modalName?: string) {
    const images = await ImageListDB.list({
      page: 1,
      pageSize: 50,
      modalName,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    return images.data.map(image => ({
      id: image.id,
      name: image.nameFile,
      url: ImageListUtils.getVariantUrl(image.imageUrl, 'small'),
      thumbnailUrl: ImageListUtils.getVariantUrl(image.imageUrl, 'thumbnail'),
      createdAt: image.createdAt,
      createdBy: image.createdBy
    }));
  }

  // 6.3 Use Case: ทำความสะอาดรูปภาพเก่า
  async function cleanupOldImages(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // หารูปที่ถูกลบและเก่ากว่า X วัน
    const oldImages = await ImageListDB.getByDateRange(
      new Date('2000-01-01'), 
      cutoffDate
    );

    const deletedImages = oldImages.filter(img => img.deleteBy !== '');
    
    console.log(`🧹 Found ${deletedImages.length} old deleted images`);

    // Hard delete รูปที่เก่ามาก
    for (const image of deletedImages) {
      await ImageListDB.hardDelete(image.id);
    }

    return deletedImages.length;
  }

  // 6.4 Use Case: Dashboard Statistics
  async function getDashboardStats() {
    const stats = await ImageListDB.getStats();
    
    // รูปภาพที่อัพโหลดวันนี้
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayImages = await ImageListDB.getByDateRange(today, new Date());

    // รูปภาพยอดนิยม (ตาม modalName)
    const recentImages = await ImageListDB.list({ 
      page: 1, 
      pageSize: 1000 
    });
    
    const modalPopularity = recentImages.data.reduce((acc, img) => {
      const modal = img.modalName || 'other';
      acc[modal] = (acc[modal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStats: stats,
      todayUploads: todayImages.length,
      modalPopularity: Object.entries(modalPopularity)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }

  // ทดสอบ use cases
  const dashboardStats = await getDashboardStats();
  console.log('📊 Dashboard stats:', dashboardStats);
  
  const galleryImages = await createAdminGallery('deposit');
  console.log('🖼️ Gallery images:', galleryImages.slice(0, 3));
}

// ======================================
// 🧪 7. Error Handling Examples
// ======================================

export async function errorHandlingExample() {
  console.log('🧪 Error Handling Example');

  try {
    // 7.1 การจัดการ error ในการอัพโหลด
    const mockErrorFile = new File([''], 'invalid.txt', { type: 'text/plain' });
    
    const result = await ImageListDB.uploadAndSave(mockErrorFile, {
      nameFile: 'should-fail.txt',
      modalName: 'test',
      createdBy: 'system'
    });

    if (!result.success) {
      console.warn('⚠️ Expected failure:', result.error);
    }

    // 7.2 การจัดการ error ในการหารูปที่ไม่มี
    const notFound = await ImageListDB.getById('non-existent-id');
    console.log('❌ Not found (expected):', notFound); // null

    // 7.3 การ validate ข้อมูลก่อนบันทึก
    const validateImageData = (data: any) => {
      const errors = [];
      
      if (!data.imageUrl) errors.push('imageUrl is required');
      if (!data.nameFile) errors.push('nameFile is required');
      if (!ImageListUtils.isValidImageUrl(data.imageUrl)) {
        errors.push('Invalid image URL');
      }
      
      return errors;
    };

    const invalidData = { imageUrl: '', nameFile: '' };
    const validationErrors = validateImageData(invalidData);
    
    if (validationErrors.length > 0) {
      console.warn('❌ Validation errors:', validationErrors);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// ======================================
// 🚀 รันตัวอย่างทั้งหมด
// ======================================

export async function runAllExamples() {
  console.log('🎬 Running all ImageListDB examples...\n');

  try {
    await basicOperationsExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await searchExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await statisticsExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Skip cloudflare example in testing (requires actual file)
    // await cloudflareExample();
    
    await bulkOperationsExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await realWorldUseCases();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await errorHandlingExample();
    
    console.log('\n✅ All examples completed successfully!');
    
  } catch (error) {
    console.error('💥 Error running examples:', error);
  }
}

// ไว้สำหรับ testing
// runAllExamples();
