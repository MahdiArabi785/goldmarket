import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // ابتدا آخرین قیمت از دیتابیس
    let lastPrice = await prisma.priceHistory.findFirst({
      orderBy: { createdAt: "desc" },
    })

    // اگر دیتابیس خالی بود، سعی می‌کنیم قیمت را دریافت کنیم
    if (!lastPrice) {
      try {
        // تلاش با tgju
        const res = await fetch("https://call.tgju.org/ajax.json", {
          headers: { "User-Agent": "Mozilla/5.0" },
        })
        const data = await res.json()
        const geram18 = data?.current?.geram18
        if (geram18 && geram18.p) {
          const goldPriceIRR = parseInt(geram18.p, 10)
          await prisma.priceHistory.create({
            data: { price: goldPriceIRR, source: "tgju.org" },
          })
          lastPrice = { price: goldPriceIRR, createdAt: new Date() } as any
        }
      } catch (e) {
        // در صورت خطا، fallback به روش دوم
        try {
          const usdRes = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
          const usdData = await usdRes.json()
          const usdToIrr = usdData.rates.IRR || 50000

          const goldRes = await fetch("https://api.exchangerate-api.com/v4/latest/XAU")
          const goldData = await goldRes.json()
          const goldPerOunceUSD = goldData.rates?.USD || 2000

          const goldPerGramUSD = goldPerOunceUSD / 31.1035
          const goldPriceIRR = Math.round(goldPerGramUSD * usdToIrr)

          await prisma.priceHistory.create({
            data: { price: goldPriceIRR, source: "exchangerate-api" },
          })
          lastPrice = { price: goldPriceIRR, createdAt: new Date() } as any
        } catch (err) {
          lastPrice = { price: 17866900, createdAt: new Date() } as any
        }
      }
    }

    const yesterdayPrice = await prisma.priceHistory.findFirst({
      where: { createdAt: { lte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: "desc" },
    })

    const price = lastPrice.price
    const change = yesterdayPrice ? price - yesterdayPrice.price : 0

    return NextResponse.json({
      price,
      change: Math.round(change),
      currency: "IRR",
      updatedAt: lastPrice.createdAt,
    })
  } catch (error) {
    return NextResponse.json({ price: 17866900, change: 0, currency: "IRR" }, { status: 200 })
  }
}