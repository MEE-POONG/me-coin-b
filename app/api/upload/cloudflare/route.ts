import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบไฟล์ที่ต้องการอัพโหลด' },
        { status: 400 }
      );
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP)' },
        { status: 400 }
      );
    }

    // ตรวจสอบขนาดไฟล์ (จำกัดที่ 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'ไฟล์มีขนาดใหญ่เกิน 10MB' },
        { status: 400 }
      );
    }

    // ตรวจสอบ environment variables
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      console.error('Missing Cloudflare credentials');
      return NextResponse.json(
        { success: false, error: 'การตั้งค่า Cloudflare ไม่ถูกต้อง' },
        { status: 500 }
      );
    }

    // อัพโหลดไปยัง Cloudflare Images
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        },
        body: uploadFormData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Cloudflare upload failed:', errorText);
      return NextResponse.json(
        { success: false, error: 'การอัพโหลดล้มเหลว' },
        { status: 500 }
      );
    }

    const result = await uploadResponse.json();

    if (!result.success) {
      console.error('Cloudflare API error:', result);
      return NextResponse.json(
        { success: false, error: 'การอัพโหลดล้มเหลว' },
        { status: 500 }
      );
    }

    // ส่งกลับข้อมูลรูปภาพ
    const imageData = result.result;
    
    return NextResponse.json({
      success: true,
      data: {
        id: imageData.id,
        filename: imageData.filename,
        uploaded: imageData.uploaded,
        variants: imageData.variants,
        // URL สำหรับแสดงผล
        url: imageData.variants[0] || `https://imagedelivery.net/${process.env.CFIMG}/${imageData.id}/public`,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการอัพโหลด' },
      { status: 500 }
    );
  }
}
