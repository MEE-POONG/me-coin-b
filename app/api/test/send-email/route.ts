import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, EmailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, template } = body

    if (!to) {
      return NextResponse.json({ error: 'Email address required' }, { status: 400 })
    }

    // ตรวจสอบว่าตั้งค่า Gmail SMTP แล้วหรือยัง
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      return NextResponse.json({ 
        error: 'Email service not configured. Please set GMAIL_USER and GMAIL_PASSWORD in .env' 
      }, { status: 500 })
    }

    let emailTemplate

    // เลือก template ตามที่ระบุ
    switch (template) {
      case 'welcome':
        emailTemplate = EmailTemplates.welcome('Test User', to)
        break
      
      case 'reset-password':
        emailTemplate = EmailTemplates.resetPassword(
          'Test User',
          `${process.env.NEXTAUTH_URL}/forgot-password?token=test123`
        )
        break
      
      case 'deposit-approved':
        emailTemplate = EmailTemplates.depositApproved('Test User', 5000, 15000)
        break
      
      case 'deposit-rejected':
        emailTemplate = EmailTemplates.depositRejected(
          'Test User',
          2000,
          'สลิปโอนเงินไม่ชัดเจน กรุณาส่งใหม่'
        )
        break
      
      case 'withdrawal-approved':
        emailTemplate = EmailTemplates.withdrawalApproved('Test User', 3000, 12000)
        break
      
      case 'transaction':
        emailTemplate = EmailTemplates.transaction('Test User', 'DEPOSIT', 1000, 6000)
        break
      
      default:
        return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
    }

    // ส่ง email
    const result = await sendEmail({
      to,
      ...emailTemplate,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: `Email sent successfully to ${to}`,
      })
    } else {
      return NextResponse.json({
        error: 'Failed to send email',
        details: result.error,
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Error in test email API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error',
    }, { status: 500 })
  }
}

