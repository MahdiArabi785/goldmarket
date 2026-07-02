// src/lib/cron.ts
import cron from "node-cron"
import { fetchAndSaveGoldPrice } from "@/lib/gold-price-fetcher"  // تغییر مسیر
import { fetchAndAnalyzeNews } from "@/server/news-actions"

export function startCronJobs() {
  cron.schedule("*/30 * * * *", async () => {
    console.log("⏰ اجرای cron: به‌روزرسانی قیمت طلا و اخبار")
    await fetchAndSaveGoldPrice()
    await fetchAndAnalyzeNews()
  })

  console.log("✅ Cron Jobs فعال شدند (هر ۳۰ دقیقه)")
}