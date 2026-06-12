"use server"

import { prisma } from "@/lib/prisma"

const GOLD_API_URL = "https://api.exchangerate-api.com/v4/latest/XAU" // طلا به دلار
const USD_TO_IRR = 500000 // نرخ تقریبی دلار به تومان – در عمل باید از API دریافت شود

export async function fetchAndSaveGoldPrice() {
  try {
    const res = await fetch(GOLD_API_URL)
    const data = await res.json()
    const goldPerOunceUSD = data.rates?.USD || 2000 // قیمت هر اونس طلا به دلار
    const goldPerGramUSD = goldPerOunceUSD / 31.1035 // تبدیل به گرم
    const goldPerGramIRR = Math.round(goldPerGramUSD * USD_TO_IRR)

    await prisma.priceHistory.create({
      data: {
        price: goldPerGramIRR,
        source: "exchangerate-api.com",
      },
    })

    console.log(`✅ قیمت طلا به‌روز شد: ${goldPerGramIRR.toLocaleString()} تومان`)
    return goldPerGramIRR
  } catch (error) {
    console.error("❌ خطا در دریافت قیمت طلا:", error)
    return null
  }
}