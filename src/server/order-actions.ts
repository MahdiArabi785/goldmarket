'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function purchaseGold(
  buyerId: string,
  productId: string,
  quantity: number = 1
) {
  // استفاده از تراکنش دیتابیس برای اطمینان از atomicity
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    })

    if (!product) throw new Error('محصول یافت نشد')
    if (product.stock < quantity) throw new Error('موجودی کافی نیست')

    const buyer = await tx.user.findUnique({ where: { id: buyerId } })
    if (!buyer) throw new Error('خریدار یافت نشد')

    const totalPrice = product.finalPrice * quantity
    if (buyer.walletBalance < totalPrice) throw new Error('موجودی کیف پول کافی نیست')

    // کسر از کیف پول خریدار
    await tx.user.update({
      where: { id: buyerId },
      data: { walletBalance: { decrement: totalPrice } }
    })

    // واریز به کیف پول فروشنده
    await tx.user.update({
      where: { id: product.sellerId },
      data: { walletBalance: { increment: totalPrice } }
    })

    // کاهش موجودی
    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } }
    })

    // ثبت سفارش
    const order = await tx.order.create({
      data: {
        buyerId,
        productId,
        quantity,
        totalPrice,
        status: 'COMPLETED'
      }
    })

    revalidatePath('/market')
    revalidatePath('/dashboard/buyer')

    return order
  })
}