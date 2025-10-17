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

  // Dynamic import after env is loaded
  const { sendEmail, EmailTemplates } = await import('../lib/email.js')

  try {
    // Test 1: Welcome Email
    console.log('Test 1: Welcome Email')
    const welcomeTemplate = EmailTemplates.welcome('TestUser', 'test@example.com')
    const result1 = await sendEmail({
      to: 'me.prompt.tec@gmail.com', // ส่งหาตัวเองเพื่อทดสอบ
      ...welcomeTemplate,
    })
    console.log(result1.success ? '✅ Success' : '❌ Failed', '\n')

    // Test 2: Reset Password Email
    console.log('Test 2: Reset Password Email')
    const resetTemplate = EmailTemplates.resetPassword(
      'TestUser',
      'http://localhost:3000/forgot-password?token=test123'
    )
    const result2 = await sendEmail({
      to: 'me.prompt.tec@gmail.com',
      ...resetTemplate,
    })
    console.log(result2.success ? '✅ Success' : '❌ Failed', '\n')

    // Test 3: Deposit Approved Email
    console.log('Test 3: Deposit Approved Email')
    const depositTemplate = EmailTemplates.depositApproved('TestUser', 5000, 15000)
    const result3 = await sendEmail({
      to: 'me.prompt.tec@gmail.com',
      ...depositTemplate,
    })
    console.log(result3.success ? '✅ Success' : '❌ Failed', '\n')

    // Test 4: Transaction Notification
    console.log('Test 4: Transaction Notification')
    const transactionTemplate = EmailTemplates.transaction('TestUser', 'DEPOSIT', 1000, 6000)
    const result4 = await sendEmail({
      to: 'me.prompt.tec@gmail.com',
      ...transactionTemplate,
    })
    console.log(result4.success ? '✅ Success' : '❌ Failed', '\n')

    console.log('🎉 All tests completed!')
    console.log('\n📧 Check inbox of me.prompt.tec@gmail.com')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

testEmail()

