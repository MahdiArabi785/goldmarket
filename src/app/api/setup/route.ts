// src/app/api/setup/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // بررسی وجود کاربر root
    const existing = await prisma.user.findUnique({
      where: { phone: "root" },
    })

    if (existing) {
      return NextResponse.json({ message: "✅ کاربر ادمین از قبل وجود دارد." })
    }

    // ساخت کاربر ادمین با رمز عبور هش‌شده
    const hashedPassword = await bcrypt.hash("toor", 10)
    await prisma.user.create({
      data: {
        phone: "root",
        name: "مدیر ارشد",
        password: hashedPassword,
        role: "ADMIN",
        phoneVerified: new Date(),
      },
    })

    return NextResponse.json({ message: "🎉 کاربر ادمین با موفقیت ساخته شد." })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "خطا در ساخت کاربر ادمین." }, { status: 500 })
  }
}