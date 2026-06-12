import cron from "node-cron"
import { fetchAndSaveGoldPrice } from "@/server/price-actions"
import { fetchAndAnalyzeNews } from "@/server/news-actions"

export function startCronJobs() {
  // هر ۳۰ دقیقه یک‌بار
  cron.schedule("*/30 * * * *", async () => {
    console.log("⏰ اجرای cron: به‌روزرسانی قیمت طلا و اخبار")
    await fetchAndSaveGoldPrice()
    await fetchAndAnalyzeNews()
  })

  console.log("✅ Cron Jobs فعال شدند (هر ۳۰ دقیقه)")
}