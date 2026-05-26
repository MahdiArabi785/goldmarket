'use server'

import { randomInt } from 'crypto'

// ارسال کد (در محیط واقعی از سرویس پیامک استفاده می‌شود)
export async function sendOTP(phone: string) {
  const code = randomInt(100000, 999999).toString()
  
  // ذخیره کد با expiry ۵ دقیقه در Redis یا دیتابیس
  await prisma.verificationToken.create({
    data: {
      identifier: phone,
      token: code,
      expires: new Date(Date.now() + 5 * 60 * 1000)
    }
  })

  // در نسخه توسعه، کد در کنسول چاپ می‌شود
  console.log(`🔐 OTP for ${phone}: ${code}`)
  
  return { success: true }
}

// تأیید کد
export async function verifyOTP(phone: string, code: string) {
  const token = await prisma.verificationToken.findFirst({
    where: {
      identifier: phone,
      token: code,
      expires: { gt: new Date() }
    }
  })

  if (!token) throw new Error('کد نامعتبر یا منقضی شده')

  // حذف توکن استفاده‌شده
  await prisma.verificationToken.delete({ where: { identifier } })

  // یافتن یا ایجاد کاربر
  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone, role: 'BUYER' }
  })

  return user
}