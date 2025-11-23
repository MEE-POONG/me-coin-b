import { NextRequest, NextResponse } from 'next/server';
import ImageListDB from '@/lib/ImageListDB';

// POST - กู้คืนรูปภาพที่ถูกลบ (bulk restore)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ids array is required' },
        { status: 400 }
      );
    }

    const restoredCount = await ImageListDB.bulkRestore(ids);

    return NextResponse.json({
      success: true,
      restoredCount
    });
  } catch (error: any) {
    console.error('Error restoring images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore images' },
      { status: 500 }
    );
  }
}

// PUT - กู้คืนรูปภาพเดียว
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const restoredImage = await ImageListDB.restore(id);

    return NextResponse.json({
      success: true,
      data: restoredImage
    });
  } catch (error: any) {
    console.error('Error restoring image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore image' },
      { status: 500 }
    );
  }
}
