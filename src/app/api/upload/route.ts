import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ error: "فایلی ارسال نشده" }, { status: 400 })
    }

    // بررسی نوع فایل (اختیاری)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "فقط تصاویر مجاز هستند" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ایجاد پوشه uploads اگر وجود ندارد
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await import("fs/promises").then(fs => fs.mkdir(uploadDir, { recursive: true }))

    // نام‌گذاری یکتا
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/\s+/g, "-")}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    const imageUrl = `/uploads/${fileName}`
    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "خطا در بارگذاری فایل" }, { status: 500 })
  }
}