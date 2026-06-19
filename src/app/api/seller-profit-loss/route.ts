import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 })
  }

  const sellerId = (session.user as any).id

  try {
    const products = await prisma.product.findMany({
      where: { sellerId },
    })

    if (products.length === 0) {
      return NextResponse.json({
        totalWeight: 0,
        totalInventoryValue: 0,
        totalCost: 0,
        profit: 0,
        percentage: 0,
        products: [],
      })
    }

    // دریافت قیمت لحظه‌ای طلا
    const latestPrice = await prisma.priceHistory.findFirst({
      orderBy: { createdAt: "desc" },
    })
    const currentGoldPrice = latestPrice?.price || 20000000

    let totalInventoryValue = 0
    let totalCost = 0
    let totalWeight = 0
    const productDetails: any[] = []

    products.forEach((product) => {
      const weight = product.weight * product.stock
      totalWeight += weight

      // ارزش فعلی = وزن کل × قیمت لحظه‌ای
      const currentValue = weight * currentGoldPrice

      // هزینه تمام‌شده = قیمت فروش ÷ (۱ + درصد سود/۱۰۰)
      const costPerUnit = product.finalPrice / (1 + product.profitPercent / 100)
      const cost = costPerUnit * product.stock

      totalInventoryValue += currentValue
      totalCost += cost

      productDetails.push({
        id: product.id,
        name: product.name,
        weight: product.weight,
        stock: product.stock,
        currentValue: Math.round(currentValue),
        cost: Math.round(cost),
        profit: Math.round(currentValue - cost),
        percentage: cost > 0 ? (((currentValue - cost) / cost) * 100).toFixed(2) : 0,
      })
    })

    const totalProfit = totalInventoryValue - totalCost
    const percentage = totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(2) : 0

    return NextResponse.json({
      totalWeight,
      totalInventoryValue: Math.round(totalInventoryValue),
      totalCost: Math.round(totalCost),
      profit: Math.round(totalProfit),
      percentage: parseFloat(percentage as string),
      products: productDetails,
    })
  } catch (error) {
    console.error("Error in seller-profit-loss:", error)
    return NextResponse.json({ error: "خطا در محاسبه" }, { status: 500 })
  }
}