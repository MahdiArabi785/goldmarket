// src/lib/gold-price-fetcher.ts
import { prisma } from "@/lib/prisma"

export async function fetchAndSaveGoldPrice() {
  // ۱. تلاش با API tgju.org
  try {
    console.log("📡 [CRON] تلاش با API tgju.org...")
    const res = await fetch("https://call1.tgju.org/ajax.json", {
      headers: { "User-Agent": "Mozilla/5.0" },
    })
    if (res.ok) {
      const data = await res.json()
      const geram18 = data?.current?.geram18
      if (geram18?.p) {
        const price = parseInt(geram18.p, 10)
        await prisma.priceHistory.create({ data: { price, source: "tgju.org" } })
        console.log(`✅ قیمت طلا (tgju): ${price.toLocaleString()} تومان`)
        return price
      }
    }
  } catch (e) {
    console.warn("⚠️ [CRON] tgju در دسترس نیست.")
  }

  // ۲. تلاش با API Wallex (صرافی ایرانی معتبر)
  try {
    console.log("📡 [CRON] تلاش با API Wallex...")
    const res = await fetch("https://api.wallex.ir/v1/markets", {
      headers: { "User-Agent": "Mozilla/5.0" },
    })
    if (res.ok) {
      const data = await res.json()
      const gold18 = data?.result?.symbols?.["GOLD18"]
      if (gold18?.bestSell) {
        const price = parseInt(gold18.bestSell, 10)
        if (price > 0) {
          await prisma.priceHistory.create({ data: { price, source: "wallex.ir" } })
          console.log(`✅ قیمت طلا (Wallex): ${price.toLocaleString()} تومان`)
          return price
        }
      }
    }
  } catch (e) {
    console.warn("⚠️ [CRON] Wallex در دسترس نیست.")
  }

  // ۳. تلاش با API way2pay.ir
  try {
    console.log("📡 [CRON] تلاش با API way2pay.ir...")
    const res = await fetch("https://api.way2pay.ir/gold/geram18")
    if (res.ok) {
      const data = await res.json()
      const price = parseInt(data.price, 10)
      if (price > 0) {
        await prisma.priceHistory.create({ data: { price, source: "way2pay.ir" } })
        console.log(`✅ قیمت طلا (way2pay): ${price.toLocaleString()} تومان`)
        return price
      }
    }
  } catch (e) {
    console.warn("⚠️ [CRON] way2pay در دسترس نیست.")
  }

  console.warn("⚠️ [CRON] هیچ API در دسترس نبود. قیمت قبلی معتبر باقی می‌ماند.")
  return null
}