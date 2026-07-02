// src/server/auth-actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { generateOTP } from "@/lib/utils"
import bcrypt from "bcryptjs"
import { sendOTPEmail } from "@/lib/mailer"

// ========================================
// ثبت‌نام کاربر جدید (پشتیبانی از phone و email)
// ========================================
export async function registerUser(data: {
  type: "phone" | "email"
  phone?: string
  email?: string
  name?: string
  password: string
}) {
  try {
    const isPhone = data.type === "phone"
    const identifier = isPhone ? data.phone! : data.email!

    if (!identifier) {
      return { success: false, message: "اطلاعات ورودی ناقص است" }
    }

    // بررسی تکراری نبودن
    const existing = await prisma.user.findFirst({
      where: isPhone ? { phone: identifier } : { email: identifier },
    })

    if (existing) {
      return {
        success: false,
        message: isPhone
          ? "این شماره موبایل قبلاً ثبت شده است"
          : "این ایمیل قبلاً ثبت شده است",
      }
    }

    // هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // ایجاد کاربر
    await prisma.user.create({
      data: {
        phone: isPhone ? identifier : undefined,
        email: !isPhone ? identifier : undefined,
        name: data.name || undefined,
        password: hashedPassword,
        role: "BUYER",
        walletBalance: 0,
      },
    })

    return {
      success: true,
      message: "ثبت‌نام با موفقیت انجام شد. به صفحه ورود منتقل می‌شوید...",
    }
  } catch (error) {
    console.error("Error registering user:", error)
    return { success: false, message: "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید." }
  }
}

// ========================================
// ورود با نام کاربری (phone یا email) و رمز عبور
// ========================================
export async function loginWithPassword(username: string, password: string) {
  // --- ورود مستقیم ادمین ریشه (root) ---
  if (username === "root" && password === "toor") {
    const rootUser = await prisma.user.findFirst({ where: { phone: "root" } })
    if (!rootUser || rootUser.role !== "ADMIN") {
      return { success: false, message: "حساب مدیر ریشه فعال نیست" }
    }
    return {
      success: true,
      isRoot: true,
      message: "ورود مدیر",
      identifier: "root",
    }
  }

  try {
    // جستجوی کاربر با شماره یا ایمیل
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: username },
          { email: username },
        ],
      },
    })

    if (!user || !user.password) {
      return { success: false, message: "نام کاربری یا رمز عبور اشتباه است" }
    }

    // بررسی رمز عبور
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return { success: false, message: "نام کاربری یا رمز عبور اشتباه است" }
    }

    // تعیین شناسه برای ارسال OTP (اولویت با شماره تلفن)
    const identifier = user.phone || user.email

    if (!identifier) {
      return {
        success: false,
        message: "خطا در حساب کاربری. لطفاً با پشتیبانی تماس بگیرید.",
      }
    }

    // تولید کد OTP
    const code = generateOTP()

    // ذخیره کد
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: code,
        expires: new Date(Date.now() + 5 * 60 * 1000), // ۵ دقیقه
      },
    })

    // ارسال کد از طریق ایمیل (در صورت وجود ایمیل)، در غیر این صورت چاپ در کنسول
    if (user.email) {
      await sendOTPEmail({
        to: user.email,
        otp: code,
        name: user.name || "کاربر",
      })
      console.log(`📧 ایمیل OTP به ${user.email} ارسال شد (کد: ${code})`)
    } else {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`🔐 کد تأیید برای ${identifier}`)
      console.log(`📱 کد: ${code}`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    }

    return {
      success: true,
      message: `کد تأیید به ${user.email ? "ایمیل" : "شماره موبایل"} شما ارسال شد`,
      identifier,
    }
  } catch (error) {
    console.error("Error logging in:", error)
    return { success: false, message: "خطا در ورود. لطفاً دوباره تلاش کنید." }
  }
}

// ========================================
// ارسال مجدد کد OTP
// ========================================
export async function resendOTP(identifier: string) {
  try {
    // حذف کدهای قبلی
    await prisma.verificationToken.deleteMany({
      where: { identifier },
    })

    const code = generateOTP()

    await prisma.verificationToken.create({
      data: {
        identifier,
        token: code,
        expires: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    // پیدا کردن کاربر برای ارسال ایمیل
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier },
        ],
      },
    })

    if (user?.email) {
      await sendOTPEmail({
        to: user.email,
        otp: code,
        name: user.name || "کاربر",
      })
      console.log(`📧 ایمیل مجدد OTP به ${user.email} ارسال شد (کد: ${code})`)
    } else {
      console.log(`🔐 Resent OTP for ${identifier}: ${code}`)
    }

    return { success: true, message: "کد جدید ارسال شد" }
  } catch (error) {
    console.error("Error resending OTP:", error)
    return { success: false, message: "خطا در ارسال مجدد کد" }
  }
}

// ========================================
// ارسال OTP ساده (ورود بدون رمز - اختیاری)
// ========================================
export async function sendOTP(phone: string) {
  try {
    const code = generateOTP()

    await prisma.verificationToken.create({
      data: {
        identifier: phone,
        token: code,
        expires: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    console.log(`🔐 OTP for ${phone}: ${code}`)

    return { success: true, message: "کد تأیید ارسال شد" }
  } catch (error) {
    console.error("Error sending OTP:", error)
    return { success: false, message: "خطا در ارسال کد تأیید" }
  }
}

// ========================================
// تأیید OTP (بدون استفاده از NextAuth - مستقیم)
// ========================================
export async function verifyOTP(identifier: string, code: string) {
  try {
    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: code,
        expires: { gt: new Date() },
      },
    })

    if (!token) {
      throw new Error("کد نامعتبر یا منقضی شده است")
    }

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier,
          token: code,
        },
      },
    })

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier },
        ],
      },
    })

    if (!user) {
      throw new Error("کاربر یافت نشد")
    }

    return { success: true, user }
  } catch (error: any) {
    return { success: false, message: error.message || "خطا در تأیید کد" }
  }
}