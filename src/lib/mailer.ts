// src/lib/mailer.ts
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,         // ایمیل فرستنده (مثلاً goldmarket@gmail.com)
    pass: process.env.EMAIL_APP_PASSWORD, // App Password گوگل
  },
})

interface SendOTPParams {
  to: string
  otp: string
  name?: string
}

export async function sendOTPEmail({ to, otp, name = "کاربر" }: SendOTPParams) {
  const html = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    @media only screen and (max-width: 600px) {
      .container { padding: 20px !important; }
      .code { font-size: 32px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family: 'Segoe UI', Tahoma, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0;">🏪 GoldMarket</h1>
              <p style="color: #fef3c7; margin: 10px 0 0; font-size: 16px;">بازار هوشمند طلا</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center;">
              <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 10px;">سلام ${name} عزیز 👋</h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
                کد تأیید شما برای ورود به حساب کاربری GoldMarket
              </p>
              <!-- OTP Code -->
              <div style="margin: 30px 0; display: inline-block; background: #fef3c7; border-radius: 15px; padding: 15px 40px;">
                <span style="font-size: 40px; font-weight: bold; color: #d97706; letter-spacing: 10px; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 20px;">
                این کد تا ۵ دقیقه معتبر است.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background: #f59e0b; border-radius: 12px; padding: 14px 30px;">
                    <a href="#" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">تأیید و ورود</a>
                  </td>
                </tr>
              </table>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ۱۴۰۳ GoldMarket. تمام حقوق محفوظ است.
              </p>
              <p style="color: #d1d5db; font-size: 11px; margin: 5px 0 0;">
                این یک ایمیل خودکار است، لطفاً به آن پاسخ ندهید.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  try {
    await transporter.sendMail({
      from: `"GoldMarket" <${process.env.EMAIL_USER}>`,
      to,
      subject: `${otp} کد تأیید ورود به GoldMarket`,
      html,
    })
    console.log(`✅ ایمیل OTP به ${to} ارسال شد`)
    return { success: true }
  } catch (error) {
    console.error("❌ خطا در ارسال ایمیل:", error)
    return { success: false, error }
  }
}