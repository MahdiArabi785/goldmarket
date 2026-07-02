import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// تنظیم Cloudinary (فقط در Vercel استفاده می‌شود)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ error: "فایلی ارسال نشده" }, { status: 400 })
    }

    // بررسی نوع فایل
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "فقط تصاویر مجاز هستند" }, { status: 400 })
    }

    // اگر Cloudinary تنظیم شده بود (محیط Production)
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // آپلود روی Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "goldmarket" },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(buffer)
      })

      return NextResponse.json({ url: result.secure_url })
    }

    // ذخیره محلی (فقط برای محیط توسعه)
    const { writeFile, mkdir } = await import("fs/promises")
    const path = await import("path")
    
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
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