import { NextRequest, NextResponse } from 'next/server';
import ImageListDB from '@/lib/ImageListDB';

// POST - อัพโหลดและบันทึกในขั้นตอนเดียว
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const nameFile = formData.get('nameFile') as string;
    const modalName = formData.get('modalName') as string;
    const createdBy = formData.get('createdBy') as string;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    if (!nameFile) {
      return NextResponse.json(
        { success: false, error: 'nameFile is required' },
        { status: 400 }
      );
    }

    // อัพโหลดและบันทึกในขั้นตอนเดียว
    const result = await ImageListDB.uploadAndSave(
      file,
      {
        nameFile,
        modalName,
        createdBy
      },
      file.name
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.image
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error uploading and saving image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload and save image' },
      { status: 500 }
    );
  }
}
