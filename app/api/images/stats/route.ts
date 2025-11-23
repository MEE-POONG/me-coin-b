import { NextRequest, NextResponse } from 'next/server';
import ImageListDB from '@/lib/ImageListDB';

// GET - ดึงสถิติรูปภาพ
export async function GET(request: NextRequest) {
  try {
    const stats = await ImageListDB.getStats();

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Error fetching image stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
