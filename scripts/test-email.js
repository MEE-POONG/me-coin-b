const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

async function testEmail() {
  console.log('📧 Testing email sending...\n')
  console.log('Using Gmail:', process.env.GMAIL_USER || 'Not configured')
  console.log('Password set:', process.env.GMAIL_PASSWORD ? 'Yes ✅' : 'No ❌')
  console.log('')

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
    console.error('❌ Error: GMAIL_USER and GMAIL_PASSWORD must be set in .env')
    console.log('\nPlease add to .env:')
    console.log('GMAIL_USER="me.prompt.tec@gmail.com"')
    console.log('GMAIL_PASSWORD="your-gmail-app-password"')
    console.log('\nSee GMAIL_SETUP_STEPS.md for how to create App Password')
    process.exit(1)
  }

  try {
    const nodemailer = require('nodemailer')
    
    // สร้าง transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    })

    console.log('🔗 Verifying SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection verified!\n')

    // Test 1: Welcome Email
    console.log('Test 1: Sending Welcome Email...')
    const result1 = await transporter.sendMail({
      from: `"MeCoins" <${process.env.GMAIL_USER}>`,
      to: 'me.prompt.tec@gmail.com',
      subject: '🎉 ยินดีต้อนรับสู่ MeCoins',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>💰 ยินดีต้อนรับสู่ MeCoins</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px;">
            <p>สวัสดีคุณ <strong>TestUser</strong>,</p>
            <p>ยินดีต้อนรับสู่ระบบเติมเครดิต MeCoins!</p>
            <p>บัญชีของคุณพร้อมใช้งานแล้ว</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/login" style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">เข้าสู่ระบบ</a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>© 2024 MeCoins. All rights reserved.</p>
          </div>
        </div>
      `,
    })
    console.log('✅ Success - Message ID:', result1.messageId, '\n')

    // Test 2: Reset Password Email
    console.log('Test 2: Sending Reset Password Email...')
    const result2 = await transporter.sendMail({
      from: `"MeCoins" <${process.env.GMAIL_USER}>`,
      to: 'me.prompt.tec@gmail.com',
      subject: '🔐 รีเซ็ตรหัสผ่าน - MeCoins',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>🔐 รีเซ็ตรหัสผ่าน</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px;">
            <p>สวัสดีคุณ <strong>TestUser</strong>,</p>
            <p>คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/forgot-password?token=test123" style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">ตั้งรหัสผ่านใหม่</a>
            </div>
            <p style="color: #dc2626;">⚠️ ลิงก์หมดอายุใน 1 ชั่วโมง</p>
          </div>
        </div>
      `,
    })
    console.log('✅ Success - Message ID:', result2.messageId, '\n')

    // Test 3: Deposit Approved Email
    console.log('Test 3: Sending Deposit Approved Email...')
    const result3 = await transporter.sendMail({
      from: `"MeCoins" <${process.env.GMAIL_USER}>`,
      to: 'me.prompt.tec@gmail.com',
      subject: '✅ คำขอฝากเงินได้รับการอนุมัติ - MeCoins',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>✅ คำขอฝากเงินอนุมัติแล้ว</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px;">
            <p>สวัสดีคุณ <strong>TestUser</strong>,</p>
            <p>คำขอฝากเงินได้รับการอนุมัติแล้ว!</p>
            <div style="text-align: center; font-size: 36px; color: #10b981; font-weight: bold; margin: 20px 0;">
              +5,000 บาท
            </div>
            <div style="background: white; border: 2px solid #d1fae5; padding: 15px; border-radius: 5px;">
              <p style="margin: 5px 0;"><strong>ยอดเงินคงเหลือ:</strong></p>
              <p style="font-size: 24px; color: #0ea5e9; margin: 5px 0;">15,000 บาท</p>
            </div>
          </div>
        </div>
      `,
    })
    console.log('✅ Success - Message ID:', result3.messageId, '\n')

    console.log('🎉 All tests completed successfully!')
    console.log('\n📧 Check inbox of me.prompt.tec@gmail.com')
    console.log('📤 Check sent folder to verify emails were sent')
    
  } catch (error) {
    console.error('\n❌ Email sending failed:')
    console.error(error.message)
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:')
      console.log('1. GMAIL_PASSWORD is the App Password (not your Gmail password)')
      console.log('2. You have enabled 2-Factor Authentication')
      console.log('3. The App Password is correct (no spaces)')
      console.log('\nSee GMAIL_SETUP_STEPS.md for detailed instructions')
    }
    
    process.exit(1)
  }
}

testEmail()

