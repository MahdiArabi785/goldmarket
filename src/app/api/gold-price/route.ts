import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const lastPrice = await prisma.priceHistory.findFirst({
      orderBy: { createdAt: "desc" },
    })

    const yesterdayPrice = await prisma.priceHistory.findFirst({
      where: {
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const price = lastPrice?.price || 20000000
    const change = yesterdayPrice ? price - yesterdayPrice.price : 0

    return NextResponse.json({
      price,
      change: Math.round(change),
      currency: "IRR",
      updatedAt: lastPrice?.createdAt || new Date(),
    })
  } catch {
    return NextResponse.json(
      { price: 20000000, change: 0, currency: "IRR" },
      { status: 200 }
    )
  }
}