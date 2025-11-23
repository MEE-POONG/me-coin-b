import { NextRequest, NextResponse } from 'next/server';

// GET - ทดสอบ environment variables
export async function GET(request: NextRequest) {
  try {
    const env = {
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID ? '✅ Set' : '❌ Missing',
      CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN ? '✅ Set' : '❌ Missing',
      CFIMG: process.env.CFIMG ? '✅ Set' : '❌ Missing',
      CLOUDFLARE_KEY: process.env.CLOUDFLARE_KEY ? '✅ Set' : '❌ Missing',
    };

    return NextResponse.json({
      success: true,
      environment: env,
      message: 'Environment variables status'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
