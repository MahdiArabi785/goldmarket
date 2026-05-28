"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

// دریافت همه کاربران
export async function getAllUsers() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("دسترسی غیرمجاز")
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      walletBalance: true,
      createdAt: true,
    },
  })
}

// دریافت یک کاربر با شناسه
export async function getUserById(userId: string) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("دسترسی غیرمجاز")
  return prisma.user.findUnique({ where: { id: userId } })
}

// ایجاد کاربر جدید توسط ادمین (بدون احراز هویت)
export async function adminCreateUser(data: {
  phone?: string
  email?: string
  name?: string
  password: string
  role: string
}) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("دسترسی غیرمجاز")

  if (data.phone) {
    const exists = await prisma.user.findUnique({ where: { phone: data.phone } })
    if (exists) throw new Error("این شماره موبایل قبلاً ثبت شده است")
  }
  if (data.email) {
    const exists = await prisma.user.findUnique({ where: { email: data.email } })
    if (exists) throw new Error("این ایمیل قبلاً ثبت شده است")
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)
  const user = await prisma.user.create({
    data: {
      phone: data.phone || undefined,
      email: data.email || undefined,
      name: data.name,
      password: hashedPassword,
      role: data.role,
      phoneVerified: new Date(),
    },
  })

  revalidatePath("/dashboard/admin/users")
  return user
}

// حذف کاربر
export async function adminDeleteUser(userId: string) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("دسترسی غیرمجاز")
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath("/dashboard/admin/users")
}

// به‌روزرسانی کاربر (تغییر نقش، نام، رمز و...)
export async function adminUpdateUser(
  userId: string,
  data: {
    name?: string
    phone?: string
    email?: string
    role?: string
    walletBalance?: number
    password?: string
  }
) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("دسترسی غیرمجاز")

  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.email !== undefined) updateData.email = data.email
  if (data.role !== undefined) updateData.role = data.role
  if (data.walletBalance !== undefined) updateData.walletBalance = data.walletBalance
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  })

  revalidatePath("/dashboard/admin/users")
  return user
}

// دریافت همه محصولات (برای مدیریت ادمین)
export async function adminGetAllProducts() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("دسترسی غیرمجاز")
  return prisma.product.findMany({
    include: { seller: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  })
}

// حذف محصول توسط ادمین
export async function adminDeleteProduct(productId: string) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("دسترسی غیرمجاز")
  await prisma.product.delete({ where: { id: productId } })
  revalidatePath("/dashboard/admin/products")
}