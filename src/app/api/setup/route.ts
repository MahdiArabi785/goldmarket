// src/app/api/setup/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // بررسی اینکه آیا کاربر root از قبل وجود دارد
    const existing = await prisma.user.findUnique({
      where: { phone: "root" },
    })

    if (existing) {
      return NextResponse.json({ message: "✅ کاربر ادمین از قبل وجود دارد." })
    }

    // ایجاد کاربر ادمین
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
    return NextResponse.json({ error: "خطا در ساخت کاربر ادمین." }, { status: 500 })
  }
}