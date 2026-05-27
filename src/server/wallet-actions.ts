"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getWalletBalance(): Promise<number> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const userId = (session.user as any).id
  const user = await prisma.user.findUnique({ where: { id: userId } })
  
  return user?.walletBalance || 0
}

export async function depositToWallet(amount: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const userId = (session.user as any).id

  if (amount < 100000) throw new Error("حداقل مبلغ شارژ ۱۰۰,۰۰۰ تومان است")
  if (amount > 50000000) throw new Error("حداکثر مبلغ شارژ ۵۰,۰۰۰,۰۰۰ تومان است")

  return await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: amount } },
    })

    const transaction = await tx.walletTransaction.create({
      data: {
        userId,
        amount,
        type: "DEPOSIT",
        description: `شارژ کیف پول - ${amount.toLocaleString("fa-IR")} تومان`,
      },
    })

    revalidatePath("/wallet")
    revalidatePath("/dashboard/buyer")

    return transaction
  })
}

export async function withdrawFromWallet(amount: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const userId = (session.user as any).id

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error("کاربر یافت نشد")
    if (user.walletBalance < amount) throw new Error("موجودی کیف پول کافی نیست")

    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: amount } },
    })

    const transaction = await tx.walletTransaction.create({
      data: {
        userId,
        amount: -amount,
        type: "WITHDRAW",
        description: `برداشت از کیف پول - ${amount.toLocaleString("fa-IR")} تومان`,
      },
    })

    revalidatePath("/wallet")
    revalidatePath("/dashboard/buyer")

    return transaction
  })
}

export async function getWalletTransactions() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const userId = (session.user as any).id

  return prisma.walletTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}