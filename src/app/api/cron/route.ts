import { NextResponse } from "next/server"
import { fetchAndSaveGoldPrice } from "@/server/price-actions"
import { fetchAndAnalyzeNews } from "@/server/news-actions"

export async function GET() {
  try {
    await fetchAndSaveGoldPrice()
    await fetchAndAnalyzeNews()
    return NextResponse.json({ success: true, message: "قیمت و اخبار به‌روزرسانی شدند" })
  } catch (error) {
    return NextResponse.json({ error: "خطا در اجرای cron" }, { status: 500 })
  }
}