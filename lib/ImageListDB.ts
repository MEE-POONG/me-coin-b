import { Prisma, GalleryDB } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// ==================== INTERFACES ====================

export interface ImageListSearchParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  modalName?: string;
  createdBy?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'nameFile';
  sortOrder?: 'asc' | 'desc';
}

export interface ImageListResult {
  data: GalleryDB[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateImageData {
  imageUrl: string;
  nameFile: string;
  modalName?: string;
  createdBy?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateImageData {
  imageUrl?: string;
  nameFile?: string;
  modalName?: string;
  updatedBy?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface CloudflareUploadResult {
  success: boolean;
  data?: {
    id: string;
    filename: string;
    url: string;
    variants: string[];
  };
  error?: string;
}

// ==================== MAIN CLASS ====================

export class ImageListDB {
  
  // 📋 ดึงรายการรูปภาพแบบมี pagination
  static async list(params: ImageListSearchParams = {}): Promise<ImageListResult> {
    const {
      page = 1,
      pageSize = 10,
      keyword = '',
      modalName,
      createdBy,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const skip = (page - 1) * pageSize;

    // สร้าง where clause
    const andConditions: Prisma.GalleryDBWhereInput[] = [];
    
    // ค้นหาตาม keyword
    if (keyword) {
      andConditions.push({
        OR: [
          { nameFile: { contains: keyword, mode: 'insensitive' } },
          { modalName: { contains: keyword, mode: 'insensitive' } },
        ]
      });
    }

    // กรองตาม modalName
    if (modalName) {
      andConditions.push({ modalName: { contains: modalName, mode: 'insensitive' } });
    }

    // กรองตาม createdBy
    if (createdBy) {
      andConditions.push({ createdBy });
    }

    const where: Prisma.GalleryDBWhereInput = {
      deleteBy: '', // ไม่ถูกลบ
      ...(andConditions.length > 0 && { AND: andConditions })
    };

    // ดำเนินการ query
    const [items, total] = await Promise.all([
      prisma.galleryDB.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.galleryDB.count({ where })
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: items,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        pageSize,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // 🔍 ค้นหารูปภาพด้วย advanced search
  static async search(keyword: string, options: Omit<ImageListSearchParams, 'keyword'> = {}): Promise<ImageListResult> {
    return this.list({ ...options, keyword });
  }

  // 👁️ ดึงรูปภาพตาม ID
  static async getById(id: string): Promise<GalleryDB | null> {
    return prisma.galleryDB.findUnique({
      where: { 
        id,
        deleteBy: '' // ไม่ถูกลบ
      }
    });
  }

  // ➕ เพิ่มรูปภาพใหม่
  static async create(data: CreateImageData): Promise<GalleryDB> {
    const now = new Date();

    return prisma.galleryDB.create({
      data: {
        imageUrl: data.imageUrl,
        nameFile: data.nameFile,
        modalName: data.modalName || '',
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy || '',
        updatedBy: data.createdBy || '',
        deleteBy: '',
      }
    });
  }

  // ✏️ แก้ไขรูปภาพ
  static async update(id: string, data: UpdateImageData): Promise<GalleryDB> {
    const updateData: Prisma.GalleryDBUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.nameFile !== undefined) updateData.nameFile = data.nameFile;
    if (data.modalName !== undefined) updateData.modalName = data.modalName;
    if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;

    return prisma.galleryDB.update({
      where: { id },
      data: updateData
    });
  }

  // 🗑️ ลบรูปภาพ (soft delete)
  static async softDelete(id: string, deletedBy: string = 'system'): Promise<void> {
    await prisma.galleryDB.update({
      where: { id },
      data: {
        deleteBy: deletedBy,
        updatedAt: new Date()
      }
    });
  }

  // ❌ ลบรูปภาพแบบถาวร (hard delete)
  static async hardDelete(id: string): Promise<void> {
    await prisma.galleryDB.delete({
      where: { id }
    });
  }

  // 🔄 กู้คืนรูปภาพที่ถูกลบ
  static async restore(id: string): Promise<GalleryDB> {
    return prisma.galleryDB.update({
      where: { id },
      data: {
        deleteBy: '',
        updatedAt: new Date()
      }
    });
  }

  // 📊 สถิติรูปภาพ
  static async getStats() {
    const [total, active, deleted] = await Promise.all([
      prisma.galleryDB.count(),
      prisma.galleryDB.count({ where: { deleteBy: '' } }),
      prisma.galleryDB.count({ where: { deleteBy: { not: '' } } })
    ]);

    return {
      total,
      active,
      deleted,
      deletedPercentage: total > 0 ? Math.round((deleted / total) * 100) : 0
    };
  }

  // 🏷️ ค้นหาตาม modalName
  static async getByModalName(modalName: string, limit: number = 10): Promise<GalleryDB[]> {
    return prisma.galleryDB.findMany({
      where: {
        modalName: { contains: modalName, mode: 'insensitive' },
        deleteBy: ''
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // 👤 ค้นหาตาม createdBy
  static async getByCreatedBy(createdBy: string, limit: number = 10): Promise<GalleryDB[]> {
    return prisma.galleryDB.findMany({
      where: {
        createdBy,
        deleteBy: ''
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  // 📅 ค้นหาตามช่วงวันที่
  static async getByDateRange(startDate: Date, endDate: Date): Promise<GalleryDB[]> {
    return prisma.galleryDB.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        deleteBy: ''
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 🔄 Bulk operations
  static async bulkDelete(ids: string[], deletedBy: string = 'system'): Promise<number> {
    const result = await prisma.galleryDB.updateMany({
      where: { 
        id: { in: ids },
        deleteBy: '' // เฉพาะที่ยังไม่ถูกลบ
      },
      data: {
        deleteBy: deletedBy,
        updatedAt: new Date()
      }
    });
    return result.count;
  }

  static async bulkRestore(ids: string[]): Promise<number> {
    const result = await prisma.galleryDB.updateMany({
      where: { 
        id: { in: ids },
        deleteBy: { not: '' } // เฉพาะที่ถูกลบแล้ว
      },
      data: {
        deleteBy: '',
        updatedAt: new Date()
      }
    });
    return result.count;
  }

  // ☁️ Cloudflare Images Integration
  static async uploadToCloudflare(file: File | Buffer, filename?: string): Promise<CloudflareUploadResult> {
    try {
      // ตรวจสอบ environment variables
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = process.env.CLOUDFLARE_API_TOKEN;

      if (!accountId || !apiToken) {
        throw new Error('Cloudflare credentials not configured');
      }

      const formData = new FormData();
      
      if (file instanceof File) {
        formData.append('file', file);
      } else {
        // สำหรับ Buffer
        const blob = new Blob([new Uint8Array(file)]);
        formData.append('file', blob, filename || 'image.jpg');
      }

      // อัพโหลดโดยตรงไป Cloudflare Images API
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudflare upload failed:', errorText);
        throw new Error('Failed to upload to Cloudflare Images');
      }

      const result = await response.json();

      if (result.success && result.result) {
        const imageData = result.result;
        const imageUrl = imageData.variants[0] || `https://imagedelivery.net/${process.env.CFIMG}/${imageData.id}/public`;
        
        return {
          success: true,
          data: {
            id: imageData.id,
            filename: imageData.filename || filename || 'image',
            url: imageUrl,
            variants: imageData.variants || []
          }
        };
      } else {
        throw new Error(result.error || 'Cloudflare API returned unsuccessful result');
      }
    } catch (error: any) {
      console.error('Cloudflare upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload error'
      };
    }
  }

  // 📤 อัพโหลดและบันทึกลง DB ในขั้นตอนเดียว
  static async uploadAndSave(
    file: File | Buffer, 
    saveData: Omit<CreateImageData, 'imageUrl'>,
    filename?: string
  ): Promise<{ success: boolean; image?: GalleryDB; error?: string }> {
    try {
      // อัพโหลดไป Cloudflare ก่อน
      const uploadResult = await this.uploadToCloudflare(file, filename);
      
      if (!uploadResult.success || !uploadResult.data) {
        return {
          success: false,
          error: uploadResult.error || 'Upload failed'
        };
      }

      // บันทึกลง database
      const image = await this.create({
        ...saveData,
        imageUrl: uploadResult.data.url
      });

      return {
        success: true,
        image
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Save error'
      };
    }
  }
}

// ==================== UTILITY FUNCTIONS ====================

export class ImageListUtils {
  // 🔗 สร้าง URL สำหรับ Cloudflare Images variants
  static getVariantUrl(imageUrl: string, variant: 'thumbnail' | 'small' | 'medium' | 'large' | 'public' = 'public'): string {
    if (!imageUrl.includes('imagedelivery.net')) {
      return imageUrl; // ไม่ใช่ Cloudflare URL
    }

    // แยก URL เพื่อเปลี่ยน variant
    const parts = imageUrl.split('/');
    if (parts.length >= 5) {
      parts[parts.length - 1] = variant;
      return parts.join('/');
    }
    
    return imageUrl;
  }

  // 📏 สร้าง URL สำหรับขนาดเฉพาะ
  static getResizedUrl(imageUrl: string, width: number, height?: number): string {
    if (!imageUrl.includes('imagedelivery.net')) {
      return imageUrl;
    }

    const size = height ? `${width}x${height}` : `${width}`;
    const parts = imageUrl.split('/');
    if (parts.length >= 5) {
      parts[parts.length - 1] = size;
      return parts.join('/');
    }
    
    return imageUrl;
  }

  // 🏷️ แปลง tags เป็น string และกลับ
  static tagsToString(tags: string[]): string {
    return tags.join(',');
  }

  static stringToTags(tagsString: string): string[] {
    return tagsString ? tagsString.split(',').filter(tag => tag.trim()) : [];
  }

  // 🔍 validate URL
  static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // 📝 สร้างชื่อไฟล์ที่ unique
  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    
    return `${baseName}_${timestamp}_${random}.${extension}`;
  }
}

export default ImageListDB;
