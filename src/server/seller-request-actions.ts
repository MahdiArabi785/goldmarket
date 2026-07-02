// src/server/seller-request-actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

// ثبت درخواست فروشنده شدن توسط خریدار (فقط یکبار)
export async function submitSellerRequest(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  const userId = (session.user as any).id
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== "BUYER") throw new Error("فقط خریداران می‌توانند درخواست فروشندگی دهند")

  // بررسی وجود درخواست قبلی (فقط یکبار)
  const existingRequest = await prisma.sellerRequest.findFirst({
    where: {
      userId,
      status: { in: ["PENDING", "APPROVED"] },
    },
  })

  if (existingRequest) {
    if (existingRequest.status === "PENDING") {
      throw new Error("شما قبلاً یک درخواست ثبت کرده‌اید که در حال بررسی است.")
    }
    if (existingRequest.status === "APPROVED") {
      throw new Error("درخواست شما قبلاً تأیید شده و شما اکنون فروشنده هستید.")
    }
  }

  const storeName = formData.get("storeName") as string
  const description = formData.get("description") as string

  await prisma.sellerRequest.create({
    data: {
      userId,
      storeName,
      description,
      status: "PENDING",
    },
  })

  revalidatePath("/become-seller")
  return { success: true, message: "درخواست شما ثبت شد. پس از تأیید ادمین، به فروشنده تبدیل خواهید شد." }
}

// دریافت لیست درخواست‌ها برای ادمین
export async function getSellerRequests() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") throw new Error("دسترسی غیرمجاز")

  return prisma.sellerRequest.findMany({
    include: { user: { select: { name: true, phone: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })
}

// تأیید درخواست و تبدیل نقش کاربر به SELLER
export async function approveSellerRequest(requestId: string) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") throw new Error("دسترسی غیرمجاز")

  const request = await prisma.sellerRequest.findUnique({ where: { id: requestId } })
  if (!request) throw new Error("درخواست یافت نشد")
  if (request.status !== "PENDING") throw new Error("فقط درخواست‌های در انتظار را می‌توان تأیید کرد")

  await prisma.$transaction([
    prisma.sellerRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    }),
    prisma.user.update({
      where: { id: request.userId },
      data: { role: "SELLER" },
    }),
  ])

  revalidatePath("/dashboard/admin/seller-requests")
  return { success: true, message: "درخواست تأیید شد و کاربر به فروشنده تبدیل شد." }
}

// رد درخواست
export async function rejectSellerRequest(requestId: string) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") throw new Error("دسترسی غیرمجاز")

  await prisma.sellerRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  })

  revalidatePath("/dashboard/admin/seller-requests")
  return { success: true, message: "درخواست رد شد." }
}