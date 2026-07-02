"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { calculateGoldPrice } from "@/lib/price-calculator"
import { ProductType } from "@prisma/client"
import { parseImagesSafe } from "@/lib/utils"

// دریافت قیمت زنده طلا (۱۸ عیار)
async function getLiveGoldPrice(): Promise<number> {
  try {
    const lastPrice = await prisma.priceHistory.findFirst({
      orderBy: { createdAt: "desc" },
    })
    return lastPrice?.price || 17866900
  } catch {
    return 17866900
  }
}

export async function createProduct(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } })
  if (!user || user.role !== "SELLER") throw new Error("فقط فروشندگان می‌توانند محصول ثبت کنند")

  const name = formData.get("name") as string
  if (!name) throw new Error("نام محصول الزامی است")

  const type = (formData.get("type") as ProductType) || "NEW"
  const weight = parseFloat(formData.get("weight") as string)
  if (!weight) throw new Error("وزن محصول الزامی است")

  const karat = parseInt(formData.get("karat") as string) || 18
  const wage = parseFloat(formData.get("wage") as string) || 0
  const profitPercent = parseFloat(formData.get("profitPercent") as string) || 7
  const stock = parseInt(formData.get("stock") as string) || 1
  const description = (formData.get("description") as string) || ""
  const barcode = (formData.get("barcode") as string) || ""

  const imageUrlsRaw = (formData.get("imageUrls") as string) || "[]"
  const imageUrls = parseImagesSafe(imageUrlsRaw)
  const finalImages = imageUrls.length > 0 && imageUrls[0] !== "/placeholder.svg" ? imageUrls : ["/placeholder.svg"]

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
      images: JSON.stringify(finalImages),
    },
  })

  revalidatePath("/dashboard/seller/products")
  revalidatePath("/market")
  return product
}

export async function updateProduct(productId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || product.sellerId !== (session.user as any).id) {
    throw new Error("شما مجاز به ویرایش این محصول نیستید")
  }

  const liveGoldPrice = await getLiveGoldPrice()
  const wage = formData.get("wage") ? parseFloat(formData.get("wage") as string) : product.wage
  const profitPercent = formData.get("profitPercent") ? parseFloat(formData.get("profitPercent") as string) : product.profitPercent
  const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : product.weight
  const priceBreakdown = calculateGoldPrice(weight, liveGoldPrice, wage, profitPercent)

  const updateData: any = {
    wage,
    profitPercent,
    weight,
    finalPrice: priceBreakdown.finalPrice,
    stock: formData.get("stock") ? parseInt(formData.get("stock") as string) : product.stock,
    description: (formData.get("description") as string) ?? product.description,
    barcode: (formData.get("barcode") as string) ?? product.barcode,
  }

  const imageUrlsRaw = formData.get("imageUrls") as string | null
  if (imageUrlsRaw !== null) {
    const imageUrls = parseImagesSafe(imageUrlsRaw)
    updateData.images = JSON.stringify(imageUrls)
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: updateData,
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

  // فیلتر قیمت بر اساس قیمت لحظه‌ای انجام می‌شود (بعداً اعمال می‌کنیم)
  const orderBy: any = { createdAt: "desc" }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      seller: {
        select: { name: true, phone: true },
      },
    },
  })

  // دریافت قیمت زنده طلا
  const liveGoldPrice = await getLiveGoldPrice()

  // محاسبه قیمت نهایی به‌روز برای هر محصول
  let updatedProducts = products.map((product) => {
    const breakdown = calculateGoldPrice(product.weight, liveGoldPrice, product.wage, product.profitPercent)
    return {
      ...product,
      images: parseImagesSafe(product.images),
      finalPrice: breakdown.finalPrice,
      priceBreakdown: breakdown,
    }
  })

  // اعمال فیلتر قیمت (اگر وجود داشته باشد)
  if (filters?.minPrice) {
    updatedProducts = updatedProducts.filter((p) => p.finalPrice >= filters.minPrice!)
  }
  if (filters?.maxPrice) {
    updatedProducts = updatedProducts.filter((p) => p.finalPrice <= filters.maxPrice!)
  }

  // مرتب‌سازی بر اساس قیمت (اگر درخواست شده باشد)
  if (filters?.sortBy === "price_asc") {
    updatedProducts.sort((a, b) => a.finalPrice - b.finalPrice)
  } else if (filters?.sortBy === "price_desc") {
    updatedProducts.sort((a, b) => b.finalPrice - a.finalPrice)
  }

  return updatedProducts
}