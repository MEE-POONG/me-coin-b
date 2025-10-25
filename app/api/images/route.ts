import { NextRequest, NextResponse } from 'next/server';
import ImageListDB from '@/lib/ImageListDB';

// GET - ดึงรายการรูปภาพ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
      keyword: searchParams.get('keyword') || '',
      modalName: searchParams.get('modalName') || undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    const result = await ImageListDB.list(params);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST - เพิ่มรูปภาพใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, nameFile, modalName, createdBy } = body;

    if (!imageUrl || !nameFile) {
      return NextResponse.json(
        { success: false, error: 'imageUrl and nameFile are required' },
        { status: 400 }
      );
    }

    const image = await ImageListDB.create({
      imageUrl,
      nameFile,
      modalName,
      createdBy
    });

    return NextResponse.json({
      success: true,
      data: image
    });
  } catch (error: any) {
    console.error('Error creating image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create image' },
      { status: 500 }
    );
  }
}

// DELETE - ลบหลายรูปภาพ (bulk delete)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, deletedBy } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ids array is required' },
        { status: 400 }
      );
    }

    const deletedCount = await ImageListDB.bulkDelete(ids, deletedBy);

    return NextResponse.json({
      success: true,
      deletedCount
    });
  } catch (error: any) {
    console.error('Error deleting images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete images' },
      { status: 500 }
    );
  }
}
