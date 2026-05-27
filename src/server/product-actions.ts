"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { calculateGoldPrice } from "@/lib/price-calculator"
import { ProductType } from "@prisma/client"

export async function createProduct(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } })
  if (!user || user.role !== "SELLER") throw new Error("فقط فروشندگان می‌توانند محصول ثبت کنند")

  const name = formData.get("name") as string
  const type = formData.get("type") as ProductType
  const weight = parseFloat(formData.get("weight") as string)
  const karat = parseInt(formData.get("karat") as string) || 18
  const wage = parseFloat(formData.get("wage") as string) || 0
  const profitPercent = parseFloat(formData.get("profitPercent") as string) || 7
  const stock = parseInt(formData.get("stock") as string) || 1
  const description = formData.get("description") as string
  const barcode = formData.get("barcode") as string

  const liveGoldPrice = await getLiveGoldPrice()
  const priceBreakdown = calculateGoldPrice(weight, liveGoldPrice, wage, profitPercent)

  const product = await prisma.product.create({
    data: {
      sellerId: user.id,
      name,
      type,
      weight,
      karat,
      wage,
      profitPercent,
      finalPrice: priceBreakdown.finalPrice,
      stock,
      description,
      barcode,
      images: ["https://picsum.photos/seed/gold-product/400/400"],
    },
  })

  revalidatePath("/dashboard/seller/products")
  revalidatePath("/market")
  return product
}

async function getLiveGoldPrice(): Promise<number> {
  try {
    const lastPrice = await prisma.priceHistory.findFirst({
      orderBy: { createdAt: "desc" },
    })
    return lastPrice?.price || 20000000
  } catch {
    return 20000000
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || product.sellerId !== (session.user as any).id) {
    throw new Error("شما مجاز به ویرایش این محصول نیستید")
  }

  const liveGoldPrice = await getLiveGoldPrice()
  const wage = parseFloat(formData.get("wage") as string) || product.wage
  const profitPercent = parseFloat(formData.get("profitPercent") as string) || product.profitPercent
  const priceBreakdown = calculateGoldPrice(product.weight, liveGoldPrice, wage, profitPercent)

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      wage,
      profitPercent,
      finalPrice: priceBreakdown.finalPrice,
      stock: parseInt(formData.get("stock") as string) || product.stock,
      description: formData.get("description") as string,
    },
  })

  revalidatePath("/dashboard/seller/products")
  revalidatePath("/market")
  return updatedProduct
}

export async function deleteProduct(productId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || product.sellerId !== (session.user as any).id) {
    throw new Error("شما مجاز به حذف این محصول نیستید")
  }

  await prisma.product.delete({ where: { id: productId } })
  revalidatePath("/dashboard/seller/products")
  revalidatePath("/market")
  return { success: true }
}

export async function getProducts(filters?: {
  type?: ProductType
  minWeight?: number
  maxWeight?: number
  minPrice?: number
  maxPrice?: number
  verified?: boolean
  sortBy?: "price_asc" | "price_desc" | "newest" | "oldest"
}) {
  const where: any = {}

  if (filters?.type) where.type = filters.type
  if (filters?.verified) where.isVerified = true
  if (filters?.minWeight) where.weight = { ...where.weight, gte: filters.minWeight }
  if (filters?.maxWeight) where.weight = { ...where.weight, lte: filters.maxWeight }
  if (filters?.minPrice) where.finalPrice = { ...where.finalPrice, gte: filters.minPrice }
  if (filters?.maxPrice) where.finalPrice = { ...where.finalPrice, lte: filters.maxPrice }

  const orderBy: any = {}
  switch (filters?.sortBy) {
    case "price_asc": orderBy.finalPrice = "asc"; break
    case "price_desc": orderBy.finalPrice = "desc"; break
    case "newest": orderBy.createdAt = "desc"; break
    case "oldest": orderBy.createdAt = "asc"; break
    default: orderBy.createdAt = "desc"
  }

  return prisma.product.findMany({
    where,
    orderBy,
    include: {
      seller: {
        select: { name: true, phone: true },
      },
    },
  })
}