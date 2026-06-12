import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "شناسه کاربر الزامی است" }, { status: 400 })
  }

  try {
    // دریافت میانگین قیمت خرید کاربر
    const purchases = await prisma.order.findMany({
      where: {
        buyerId: userId,
        status: "COMPLETED",
      },
      include: {
        product: true,
      },
    })

    if (purchases.length === 0) {
      return NextResponse.json({
        totalInvested: 0,
        currentValue: 0,
        profit: 0,
        percentage: 0,
      })
    }

    // دریافت قیمت لحظه‌ای طلا
    const latestPrice = await prisma.priceHistory.findFirst({
      orderBy: { createdAt: "desc" },
    })
    const currentGoldPrice = latestPrice?.price || 20000000

    // محاسبه ارزش فعلی و سرمایه‌گذاری‌شده
    let totalInvested = 0
    let totalWeight = 0

    purchases.forEach((order) => {
      totalInvested += order.totalPrice
      totalWeight += order.product.weight * order.quantity
    })

    const currentValue = Math.round(totalWeight * currentGoldPrice)
    const profit = currentValue - totalInvested
    const percentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0

    return NextResponse.json({
      totalInvested,
      currentValue,
      profit,
      percentage,
    })
  } catch (error) {
    return NextResponse.json({ error: "خطا در محاسبه" }, { status: 500 })
  }
}