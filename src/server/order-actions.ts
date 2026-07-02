"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { calculateGoldPrice } from "@/lib/price-calculator"

// دریافت قیمت زنده طلا
async function getLiveGoldPrice(): Promise<number> {
  const lastPrice = await prisma.priceHistory.findFirst({
    orderBy: { createdAt: "desc" },
  })
  return lastPrice?.price || 17866900
}

export async function createOrder(productId: string, quantity: number = 1) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const buyerId = (session.user as any).id

  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: { seller: true },
    })

    if (!product) throw new Error("محصول یافت نشد")
    if (product.stock < quantity) throw new Error("موجودی کافی نیست")
    if (product.sellerId === buyerId) throw new Error("نمی‌توانید محصول خود را خریداری کنید")

    // بررسی طلای سرقتی
    const stolenReport = await tx.stolenGoldReport.findFirst({
      where: {
        OR: [{ reporterId: product.sellerId }],
        status: { in: ["PENDING", "INVESTIGATING"] },
      },
    })
    if (stolenReport) throw new Error("این محصول در لیست طلاهای سرقتی قرار دارد و امکان فروش آن وجود ندارد")

    // محاسبه قیمت نهایی با قیمت زنده طلا
    const liveGoldPrice = await getLiveGoldPrice()
    const breakdown = calculateGoldPrice(
      product.weight,
      liveGoldPrice,
      product.wage,
      product.profitPercent,
      9
    )
    const totalPrice = breakdown.finalPrice * quantity

    const buyer = await tx.user.findUnique({ where: { id: buyerId } })
    if (!buyer) throw new Error("کاربر یافت نشد")
    if (buyer.walletBalance < totalPrice) throw new Error("موجودی کیف پول کافی نیست")

    // تراکنش‌های مالی
    await tx.user.update({
      where: { id: buyerId },
      data: { walletBalance: { decrement: totalPrice } },
    })

    await tx.user.update({
      where: { id: product.sellerId },
      data: { walletBalance: { increment: totalPrice } },
    })

    await tx.walletTransaction.create({
      data: {
        userId: buyerId,
        amount: -totalPrice,
        type: "PURCHASE",
        description: `خرید ${product.name} (${quantity} عدد)`,
      },
    })

    await tx.walletTransaction.create({
      data: {
        userId: product.sellerId,
        amount: totalPrice,
        type: "SALE",
        description: `فروش ${product.name} (${quantity} عدد)`,
      },
    })

    // کاهش موجودی
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    })

    // ثبت سفارش با قیمت لحظه‌ای
    const order = await tx.order.create({
      data: {
        buyerId,
        productId,
        quantity,
        totalPrice,
        status: "COMPLETED",
      },
      include: {
        product: {
          include: {
            seller: { select: { name: true, phone: true } },
          },
        },
      },
    })

    revalidatePath("/market")
    revalidatePath("/dashboard/buyer")
    revalidatePath("/dashboard/buyer/orders")
    revalidatePath("/dashboard/seller")

    return order
  })
}

export async function cancelOrder(orderId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const userId = (session.user as any).id

  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    })

    if (!order) throw new Error("سفارش یافت نشد")
    if (order.buyerId !== userId) throw new Error("شما مجاز به لغو این سفارش نیستید")
    if (order.status !== "COMPLETED" && order.status !== "PENDING") {
      throw new Error("این سفارش قابل لغو نیست")
    }

    await tx.user.update({
      where: { id: order.buyerId },
      data: { walletBalance: { increment: order.totalPrice } },
    })

    await tx.user.update({
      where: { id: order.product.sellerId },
      data: { walletBalance: { decrement: order.totalPrice } },
    })

    await tx.product.update({
      where: { id: order.productId },
      data: { stock: { increment: order.quantity } },
    })

    await tx.walletTransaction.create({
      data: {
        userId: order.buyerId,
        amount: order.totalPrice,
        type: "REFUND",
        description: `بازگشت وجه سفارش ${order.id}`,
      },
    })

    await tx.walletTransaction.create({
      data: {
        userId: order.product.sellerId,
        amount: -order.totalPrice,
        type: "REFUND",
        description: `لغو فروش سفارش ${order.id}`,
      },
    })

    const cancelledOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    })

    revalidatePath("/dashboard/buyer/orders")
    revalidatePath("/dashboard/seller")
    revalidatePath("/market")

    return cancelledOrder
  })
}

export async function getBuyerOrders() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const buyerId = (session.user as any).id

  return prisma.order.findMany({
    where: { buyerId },
    include: {
      product: {
        include: {
          seller: { select: { name: true, phone: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getSellerOrders() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const sellerId = (session.user as any).id

  return prisma.order.findMany({
    where: { product: { sellerId } },
    include: {
      product: true,
      buyer: { select: { name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}