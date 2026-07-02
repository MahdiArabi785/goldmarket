// src/app/api/profit-loss/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  // همیشه JSON معتبر برگردان
  const defaultResponse = {
    totalInvested: 0,
    currentValue: 0,
    profit: 0,
    percentage: 0,
  }

  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(defaultResponse, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) return NextResponse.json(defaultResponse)

    const purchases = await prisma.order.findMany({
      where: {
        buyerId: userId,
        status: "COMPLETED",
      },
      include: { product: true },
    })

    if (purchases.length === 0) {
      return NextResponse.json(defaultResponse)
    }

    // آخرین قیمت طلا از دیتابیس
    const latestPrice = await prisma.priceHistory.findFirst({
      orderBy: { createdAt: "desc" },
    })
    const currentGoldPrice = latestPrice?.price || 17866900

    let totalInvested = 0
    let totalWeight = 0

    for (const order of purchases) {
      totalInvested += order.totalPrice
      totalWeight += order.product.weight * order.quantity
    }

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
    console.error("❌ profit-loss error:", error)
    return NextResponse.json(defaultResponse, { status: 500 })
  }
}