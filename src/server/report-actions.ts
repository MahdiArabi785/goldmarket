"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function submitStolenGoldReport(description: string, images: string[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("لطفاً وارد شوید")

  await prisma.stolenGoldReport.create({
    data: {
      reporterId: (session.user as any).id,
      description,
      images: JSON.stringify(images),
      status: "PENDING",
    },
  })
}