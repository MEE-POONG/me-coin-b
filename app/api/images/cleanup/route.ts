import { NextRequest, NextResponse } from 'next/server';
import ImageListDB from '@/lib/ImageListDB';

// DELETE - ลบรูปภาพที่อัพโหลดล้มเหลว (cleanup)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, imageId } = body;

    if (!imageUrl && !imageId) {
      return NextResponse.json(
        { success: false, error: 'imageUrl or imageId is required' },
        { status: 400 }
      );
    }

    // หา image ใน database ถ้ามี imageId
    if (imageId) {
      const image = await ImageListDB.getById(imageId);
      if (image) {
        await ImageListDB.hardDelete(imageId);
        console.log(`🧹 Cleaned up image from DB: ${imageId}`);
      }
    }

    // ลบจาก Cloudflare Images (ถ้ามี imageUrl)
    if (imageUrl && imageUrl.includes('imagedelivery.net')) {
      try {
        // Extract image ID from Cloudflare URL
        // URL format: https://imagedelivery.net/{accountHash}/{imageId}/public
        const urlParts = imageUrl.split('/');
        const cloudflareImageId = urlParts[urlParts.length - 2];

        if (cloudflareImageId) {
          const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
          const apiToken = process.env.CLOUDFLARE_API_TOKEN;

          if (accountId && apiToken) {
            const deleteResponse = await fetch(
              `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${cloudflareImageId}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${apiToken}`,
                },
              }
            );

            if (deleteResponse.ok) {
              console.log(`🧹 Cleaned up image from Cloudflare: ${cloudflareImageId}`);
            } else {
              console.warn(`⚠️ Could not delete from Cloudflare: ${cloudflareImageId}`);
            }
          }
        }
      } catch (cloudflareError) {
        console.error('Error deleting from Cloudflare:', cloudflareError);
        // ไม่ throw error เพราะ cleanup เป็นแค่ bonus
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Image cleanup completed'
    });

  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup image' },
      { status: 500 }
    );
  }
}
