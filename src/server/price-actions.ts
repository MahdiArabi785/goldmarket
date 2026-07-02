"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { fetchAndSaveGoldPrice } from "@/lib/gold-price-fetcher"

export { fetchAndSaveGoldPrice }

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
    where: { createdAt: { gte: startDate } },
    orderBy: { createdAt: "asc" },
  })

  return history.map((item) => ({
    date: new Intl.DateTimeFormat("fa-IR").format(item.createdAt),
    price: item.price,
  }))
}

export async function updateGoldPrice(price: number, source?: string) {
  await prisma.priceHistory.create({
    data: { price, source: source || "manual" },
  })

  revalidatePath("/market")
  revalidatePath("/analysis")
  return { success: true }
}