import { NextRequest, NextResponse } from 'next/server';
import ImageListDB from '@/lib/ImageListDB';

// GET - ค้นหารูปภาพแบบ advanced
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const keyword = searchParams.get('keyword') || '';
    const options = {
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '10'),
      modalName: searchParams.get('modalName') || undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    const result = await ImageListDB.search(keyword, options);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Error searching images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search images' },
      { status: 500 }
    );
  }
}
