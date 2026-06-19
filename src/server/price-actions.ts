// src/server/price-actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const API_KEY = process.env.EXCHANGERATE_API_KEY || ""
const BASE_URL = "https://v6.exchangerate-api.com/v6"

export async function fetchAndSaveGoldPrice() {
  if (!API_KEY) {
    console.warn("⚠️ EXCHANGERATE_API_KEY در .env تنظیم نشده است.")
    return null
  }

  try {
    // ۱. دریافت نرخ دلار به تومان
    const usdRes = await fetch(`${BASE_URL}/${API_KEY}/latest/USD`)
    if (!usdRes.ok) throw new Error(`USD fetch failed: ${usdRes.status}`)
    const usdData = await usdRes.json()
    const usdToIrr = usdData.conversion_rates?.IRR
    if (!usdToIrr) throw new Error("نرخ IRR در پاسخ USD یافت نشد")

    // ۲. دریافت قیمت انس طلا به دلار
    const goldRes = await fetch(`${BASE_URL}/${API_KEY}/latest/XAU`)
    if (!goldRes.ok) throw new Error(`XAU fetch failed: ${goldRes.status}`)
    const goldData = await goldRes.json()
    const ouncePriceUSD = goldData.conversion_rates?.USD
    if (!ouncePriceUSD) throw new Error("قیمت انس طلا در پاسخ XAU یافت نشد")

    // ۳. محاسبه قیمت هر گرم طلای ۱۸ عیار
    const gram24Price = (ouncePriceUSD * usdToIrr) / 31.1035
    const gram18Price = Math.round(gram24Price * 0.75)

    // ۴. ذخیره در دیتابیس
    await prisma.priceHistory.create({
      data: {
        price: gram18Price,
        source: "exchangerate-api.com",
      },
    })

    console.log(`✅ قیمت طلا به‌روز شد: ${gram18Price.toLocaleString()} تومان`)
    return gram18Price
  } catch (error) {
    console.error("❌ خطا در دریافت قیمت طلا:", error)
    return null
  }
}

export async function getLiveGoldPrice(): Promise<number> {
  try {
    const lastPrice = await prisma.priceHistory.findFirst({
      orderBy: { createdAt: "desc" },
    })
    return lastPrice?.price || 17866900
  } catch {
    return 17866900
  }
}

export async function getPriceHistory(days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const history = await prisma.priceHistory.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: "asc" },
  })

  return history.map((item) => ({
    date: new Intl.DateTimeFormat("fa-IR").format(item.createdAt),
    price: item.price,
  }))
}

export async function updateGoldPrice(price: number, source?: string) {
  await prisma.priceHistory.create({
    data: {
      price,
      source: source || "manual",
    },
  })

  revalidatePath("/market")
  revalidatePath("/analysis")
  return { success: true }
}