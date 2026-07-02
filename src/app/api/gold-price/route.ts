import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// تلاش برای دریافت قیمت زنده از API ایرانی (tgju یا way2pay)
async function tryFetchLivePrice() {
  try {
    console.log("📡 [API Route] تلاش با tgju...")
    const res = await fetch("https://call1.tgju.org/ajax.json", {
      headers: { "User-Agent": "Mozilla/5.0" },
    })
    if (res.ok) {
      const data = await res.json()
      const geram18 = data?.current?.geram18
      if (geram18?.p) {
        const price = parseInt(geram18.p, 10)
        await prisma.priceHistory.create({
          data: { price, source: "tgju.org" },
        })
        console.log(`✅ [API] قیمت طلا (tgju): ${price.toLocaleString()} تومان`)
        return price
      }
    }
  } catch (e) {
    console.warn("⚠️ [API] tgju در دسترس نیست.")
  }

  try {
    console.log("📡 [API Route] تلاش با way2pay...")
    const res = await fetch("https://api.way2pay.ir/gold/geram18")
    if (res.ok) {
      const data = await res.json()
      const price = parseInt(data.price, 10)
      if (price > 0) {
        await prisma.priceHistory.create({
          data: { price, source: "way2pay.ir" },
        })
        console.log(`✅ [API] قیمت طلا (way2pay): ${price.toLocaleString()} تومان`)
        return price
      }
    }
  } catch (e) {
    console.warn("⚠️ [API] way2pay در دسترس نیست.")
  }

  return null // هیچ API در دسترس نبود
}

export async function GET() {
  try {
    // ابتدا آخرین قیمت از دیتابیس
    let lastPrice = await prisma.priceHistory.findFirst({
      orderBy: { createdAt: "desc" },
    })

    // اگر دیتابیس خالی بود (اولین بار)
    if (!lastPrice) {
      console.log("⚠️ دیتابیس خالی است. تلاش برای دریافت قیمت زنده...")
      const livePrice = await tryFetchLivePrice()

      if (livePrice) {
        // اگر قیمت زنده دریافت شد، آن را برگردان
        return NextResponse.json({
          price: livePrice,
          change: 0,
          currency: "IRR",
          updatedAt: new Date().toISOString(),
        })
      } else {
        // در غیر این صورت، قیمت پیش‌فرض را در دیتابیس ذخیره کن تا دفعات بعد استفاده شود
        const defaultPrice = 17866900
        console.warn("⚠️ قیمت زنده ممکن نیست. ذخیره قیمت پیش‌فرض.")
        await prisma.priceHistory.create({
          data: {
            price: defaultPrice,
            source: "default",
          },
        })
        return NextResponse.json({
          price: defaultPrice,
          change: 0,
          currency: "IRR",
          updatedAt: new Date().toISOString(),
        })
      }
    }

    // اگر دیتابیس قیمت داشت، همان را با محاسبه تغییرات برمی‌گردانیم
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const yesterdayPrice = await prisma.priceHistory.findFirst({
      where: { createdAt: { lte: yesterday } },
      orderBy: { createdAt: "desc" },
    })

    const change = yesterdayPrice ? lastPrice.price - yesterdayPrice.price : 0

    return NextResponse.json({
      price: lastPrice.price,
      change: Math.round(change),
      currency: "IRR",
      updatedAt: lastPrice.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("❌ خطای gold-price route:", error)
    return NextResponse.json(
      { price: 17866900, change: 0, currency: "IRR" },
      { status: 200 }
    )
  }
}