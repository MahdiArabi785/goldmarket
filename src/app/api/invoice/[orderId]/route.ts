import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 })
  }

  const { orderId } = await params
  const userId = (session.user as any).id

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: {
        include: {
          seller: {
            select: { name: true, phone: true },
          },
        },
      },
      buyer: {
        select: { name: true, phone: true, email: true },
      },
    },
  })

  if (!order) {
    return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 })
  }

  if (order.buyerId !== userId && order.product.sellerId !== userId) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
  }

  // محاسبه جزئیات مالی
  const liveGoldPrice = 20000000 // می‌توانید از API قیمت استفاده کنید
  const rawPrice = order.product.weight * liveGoldPrice
  const profit = (rawPrice + order.product.wage) * (order.product.profitPercent / 100)
  const tax = (rawPrice + order.product.wage + profit) * 0.09

  // ایجاد PDF
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  // تنظیم فونت فارسی (اختیاری - نیاز به فونت Vazir دارد)
  // doc.addFont("/fonts/Vazir.ttf", "Vazir", "normal")
  // doc.setFont("Vazir")

  // هدر
  doc.setFontSize(20)
  doc.setTextColor(200, 150, 0)
  doc.text("GoldMarket", 105, 15, { align: "center" })

  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text("فاکتور خرید رسمی", 105, 22, { align: "center" })

  // خط جداکننده
  doc.setDrawColor(200, 150, 0)
  doc.setLineWidth(0.5)
  doc.line(15, 28, 195, 28)

  // اطلاعات خریدار
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text("اطلاعات خریدار:", 15, 38)
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  doc.text(`نام: ${order.buyer.name || "---"}`, 15, 45)
  doc.text(`شماره تماس: ${order.buyer.phone || "---"}`, 15, 50)
  doc.text(`تاریخ خرید: ${new Intl.DateTimeFormat("fa-IR").format(order.createdAt)}`, 15, 55)

  // اطلاعات فروشنده
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text("اطلاعات فروشنده:", 120, 38)
  doc.setFontSize(10)
  doc.setTextColor(50, 50, 50)
  doc.text(`نام فروشگاه: ${order.product.seller.name || "---"}`, 120, 45)
  doc.text(`شماره تماس: ${order.product.seller.phone || "---"}`, 120, 50)
  doc.text(`کد سفارش: ${order.id.slice(0, 8)}`, 120, 55)

  // مشخصات محصول
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text("مشخصات محصول:", 15, 68)

  const productDetails = [
    ["نام محصول", order.product.name],
    ["وزن", `${order.product.weight} گرم`],
    ["عیار", `${order.product.karat}`],
    ["تعداد", `${order.quantity} عدد`],
  ]

  ;(doc as any).autoTable({
    startY: 73,
    head: [["شرح", "مقدار"]],
    body: productDetails,
    theme: "grid",
    headStyles: {
      fillColor: [200, 150, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 100 },
    },
  })

  // جدول قیمت
  const finalY = (doc as any).lastAutoTable.finalY + 10

  const priceDetails = [
    ["قیمت خام طلا", `${Math.round(rawPrice).toLocaleString()} تومان`],
    ["اجرت ساخت", `${order.product.wage.toLocaleString()} تومان`],
    ["سود فروشنده", `${Math.round(profit).toLocaleString()} تومان`],
    ["مالیات (۹٪)", `${Math.round(tax).toLocaleString()} تومان`],
    ["قیمت نهایی", `${order.totalPrice.toLocaleString()} تومان`],
  ]

  ;(doc as any).autoTable({
    startY: finalY,
    head: [["عنوان", "مبلغ"]],
    body: priceDetails,
    theme: "grid",
    headStyles: {
      fillColor: [200, 150, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 100 },
    },
  })

  // پانوشت
  const finalTableEnd = (doc as any).lastAutoTable.finalY + 15
  doc.setFontSize(9)
  doc.setTextColor(150, 150, 150)
  doc.text("این فاکتور به صورت خودکار توسط سامانه GoldMarket صادر شده است.", 105, finalTableEnd, { align: "center" })
  doc.text("برای اطلاعات بیشتر با پشتیبانی تماس بگیرید.", 105, finalTableEnd + 5, { align: "center" })

  // تولید PDF به صورت buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${order.id.slice(0, 8)}.pdf"`,
    },
  })
}