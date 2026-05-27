import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user || (user.role !== "EXPERT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const body = await request.json()
    const { requestId, status, expertNotes } = body

    if (!requestId || !status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "اطلاعات نامعتبر" }, { status: 400 })
    }

    const updatedRequest = await prisma.expertRequest.update({
      where: { id: requestId },
      data: {
        status,
        expertNotes,
        reviewedBy: userId,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    return NextResponse.json({ error: "خطا در پردازش درخواست" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()

    const expertRequest = await prisma.expertRequest.create({
      data: {
        userId,
        images: body.images || [],
        weight: body.weight,
        karat: body.karat,
        notes: body.notes,
        status: "PENDING",
      },
    })

    return NextResponse.json(expertRequest, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "خطا در ثبت درخواست" }, { status: 500 })
  }
}