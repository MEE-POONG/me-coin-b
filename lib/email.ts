import nodemailer from 'nodemailer'
// สร้าง transporter สำหรับส่ง email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'me.prompt.tec@gmail.com',
    pass: process.env.GMAIL_PASSWORD, // App Password จาก Google
  },
})

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"MeCoins" <${process.env.GMAIL_USER || 'me.prompt.tec@gmail.com'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML สำหรับ plain text
    })

    console.log('✅ Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return { success: false, error }
  }
}

// Email Templates
export const EmailTemplates = {
  // Template สำหรับรีเซ็ตรหัสผ่าน
  resetPassword: (username: string, resetLink: string) => ({
    subject: 'รีเซ็ตรหัสผ่าน - MeCoins',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 รีเซ็ตรหัสผ่าน</h1>
            </div>
            <div class="content">
              <p>สวัสดีคุณ <strong>${username}</strong>,</p>
              <p>เราได้รับคำขอรีเซ็ตรหัสผ่านของคุณ กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">ตั้งรหัสผ่านใหม่</a>
              </div>
              <p style="color: #dc2626; margin-top: 20px;">
                ⚠️ <strong>หมายเหตุ:</strong> ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง
              </p>
              <p style="margin-top: 20px;">
                หากคุณไม่ได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลนี้
              </p>
            </div>
            <div class="footer">
              <p>© 2024 MeCoins. All rights reserved.</p>
              <p>ระบบเติมเครดิตออนไลน์</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Template สำหรับ Deposit Approved
  depositApproved: (username: string, amount: number, balance: number) => ({
    subject: '✅ คำขอฝากเงินได้รับการอนุมัติ - MeCoins',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .amount { font-size: 36px; color: #10b981; font-weight: bold; text-align: center; margin: 20px 0; }
            .info-box { background: white; border: 2px solid #d1fae5; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ คำขอฝากเงินอนุมัติแล้ว</h1>
            </div>
            <div class="content">
              <p>สวัสดีคุณ <strong>${username}</strong>,</p>
              <p>คำขอฝากเงินของคุณได้รับการอนุมัติเรียบร้อยแล้ว!</p>
              
              <div class="amount">
                +${amount.toLocaleString()} บาท
              </div>
              
              <div class="info-box">
                <p style="margin: 5px 0;"><strong>ยอดเงินคงเหลือปัจจุบัน:</strong></p>
                <p style="font-size: 24px; color: #0ea5e9; margin: 5px 0;">${balance.toLocaleString()} บาท</p>
              </div>
              
              <p>เงินได้เข้าสู่กระเป๋าของคุณแล้ว สามารถเริ่มใช้งานได้ทันที</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  เข้าสู่ระบบ
                </a>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 MeCoins. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Template สำหรับ Deposit Rejected
  depositRejected: (username: string, amount: number, reason?: string) => ({
    subject: '❌ คำขอฝากเงินถูกปฏิเสธ - MeCoins',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .info-box { background: #fee2e2; border: 2px solid #fecaca; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ คำขอฝากเงินถูกปฏิเสธ</h1>
            </div>
            <div class="content">
              <p>สวัสดีคุณ <strong>${username}</strong>,</p>
              <p>ขออภัย คำขอฝากเงินของคุณถูกปฏิเสธ</p>
              
              <div class="info-box">
                <p style="margin: 5px 0;"><strong>จำนวนเงิน:</strong> ${amount.toLocaleString()} บาท</p>
                ${reason ? `<p style="margin: 5px 0;"><strong>เหตุผล:</strong> ${reason}</p>` : ''}
              </div>
              
              <p>กรุณาตรวจสอบ:</p>
              <ul>
                <li>สลิปโอนเงินถูกต้องและชัดเจน</li>
                <li>จำนวนเงินตรงกับที่โอน</li>
                <li>โอนเข้าบัญชีที่ถูกต้อง</li>
              </ul>
              
              <p>หากมีข้อสงสัย กรุณาติดต่อฝ่ายสนับสนุน</p>
            </div>
            <div class="footer">
              <p>© 2024 MeCoins. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Template สำหรับ Withdrawal Approved
  withdrawalApproved: (username: string, amount: number, balance: number) => ({
    subject: '✅ คำขอถอนเงินได้รับการอนุมัติ - MeCoins',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .amount { font-size: 36px; color: #8b5cf6; font-weight: bold; text-align: center; margin: 20px 0; }
            .info-box { background: white; border: 2px solid #ede9fe; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ คำขอถอนเงินอนุมัติแล้ว</h1>
            </div>
            <div class="content">
              <p>สวัสดีคุณ <strong>${username}</strong>,</p>
              <p>คำขอถอนเงินของคุณได้รับการอนุมัติและดำเนินการเรียบร้อยแล้ว!</p>
              
              <div class="amount">
                ${amount.toLocaleString()} บาท
              </div>
              
              <div class="info-box">
                <p style="margin: 5px 0;"><strong>ยอดเงินคงเหลือ:</strong></p>
                <p style="font-size: 24px; color: #0ea5e9; margin: 5px 0;">${balance.toLocaleString()} บาท</p>
              </div>
              
              <p>เงินจะถูกโอนเข้าบัญชีของคุณภายใน 1-3 วันทำการ</p>
              
              <p style="color: #dc2626; margin-top: 20px;">
                ⚠️ <strong>หมายเหตุ:</strong> กรุณาตรวจสอบบัญชีธนาคารของคุณ
              </p>
            </div>
            <div class="footer">
              <p>© 2024 MeCoins. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Template สำหรับ Welcome Email
  welcome: (username: string, email: string) => ({
    subject: '🎉 ยินดีต้อนรับสู่ MeCoins',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #0ea5e9; }
            .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 ยินดีต้อนรับสู่ MeCoins</h1>
            </div>
            <div class="content">
              <p>สวัสดีคุณ <strong>${username}</strong>,</p>
              <p>ขอบคุณที่สมัครใช้งาน MeCoins! บัญชีของคุณพร้อมใช้งานแล้ว</p>
              
              <h3 style="color: #0ea5e9;">📋 ข้อมูลบัญชี</h3>
              <div class="feature">
                <strong>Username:</strong> ${username}<br>
                <strong>Email:</strong> ${email}
              </div>
              
              <h3 style="color: #0ea5e9;">✨ คุณสามารถ:</h3>
              <div class="feature">💳 เติมเครดิตเข้าระบบ</div>
              <div class="feature">🛍️ ซื้อไอเทมในร้านค้า</div>
              <div class="feature">🎁 ส่งของขวัญให้เพื่อน</div>
              <div class="feature">🔄 โอนเงินให้ผู้ใช้อื่น</div>
              <div class="feature">📊 ดูประวัติการใช้งานทั้งหมด</div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXTAUTH_URL}/login" class="button">เข้าสู่ระบบ</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 MeCoins. All rights reserved.</p>
              <p>หากมีคำถาม ติดต่อ: me.prompt.tec@gmail.com</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  // Template สำหรับ Transaction Notification
  transaction: (username: string, type: string, amount: number, balance: number) => ({
    subject: `💰 ${type === 'DEPOSIT' ? 'เติมเงิน' : type === 'WITHDRAWAL' ? 'ถอนเงิน' : 'ทำธุรกรรม'} - MeCoins`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .amount { font-size: 36px; font-weight: bold; text-align: center; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 แจ้งเตือนธุรกรรม</h1>
            </div>
            <div class="content">
              <p>สวัสดีคุณ <strong>${username}</strong>,</p>
              <p>มีการทำธุรกรรมในบัญชีของคุณ</p>
              
              <div class="amount" style="color: ${type === 'DEPOSIT' ? '#10b981' : '#ef4444'};">
                ${type === 'DEPOSIT' ? '+' : '-'}${amount.toLocaleString()} บาท
              </div>
              
              <p><strong>ประเภท:</strong> ${type}</p>
              <p><strong>ยอดคงเหลือ:</strong> ${balance.toLocaleString()} บาท</p>
              <p><strong>วันที่:</strong> ${new Date().toLocaleString('th-TH')}</p>
              
              <p style="color: #666; margin-top: 20px; font-size: 14px;">
                หากพบความผิดปกติ กรุณาติดต่อฝ่ายสนับสนุนทันที
              </p>
            </div>
            <div class="footer">
              <p>© 2024 MeCoins. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
}

