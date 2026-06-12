import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import ExcelJS from "exceljs"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "لطفاً وارد شوید" }, { status: 401 })
  }

  const userId = (session.user as any).id
  const role = (session.user as any).role

  let orders: any[] = []

  if (role === "ADMIN") {
    // ادمین همه سفارشات را می‌بیند
    orders = await prisma.order.findMany({
      include: {
        product: { include: { seller: { select: { name: true } } } },
        buyer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  } else {
    // فروشنده فقط سفارشات محصولات خودش را می‌بیند
    orders = await prisma.order.findMany({
      where: { product: { sellerId: userId } },
      include: {
        product: { include: { seller: { select: { name: true } } } },
        buyer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  // ایجاد Workbook
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("گزارش فروش")

  // عنوان
  sheet.mergeCells("A1:H1")
  const titleCell = sheet.getCell("A1")
  titleCell.value = "گزارش فروش - GoldMarket"
  titleCell.font = { size: 16, bold: true, color: { argb: "FFC89600" } }
  titleCell.alignment = { horizontal: "center" }

  // تاریخ گزارش
  sheet.mergeCells("A2:H2")
  const dateCell = sheet.getCell("A2")
  dateCell.value = `تاریخ: ${new Intl.DateTimeFormat("fa-IR").format(new Date())}`
  dateCell.font = { size: 10, color: { argb: "FF666666" } }
  dateCell.alignment = { horizontal: "center" }

  // هدر جدول
  const headerRow = sheet.addRow(4)
  const headers = ["ردیف", "شماره سفارش", "محصول", "خریدار", "تعداد", "قیمت واحد", "قیمت کل", "تاریخ"]
  headerRow.values = headers

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC89600" },
    }
    cell.alignment = { horizontal: "center" }
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    }
  })

  // داده‌ها
  let totalSum = 0
  orders.forEach((order, index) => {
    const row = sheet.addRow([
      index + 1,
      order.id.slice(0, 8),
      order.product.name,
      order.buyer.name || order.buyer.phone,
      order.quantity,
      Math.round(order.totalPrice / order.quantity),
      order.totalPrice,
      new Intl.DateTimeFormat("fa-IR").format(order.createdAt),
    ])

    row.eachCell((cell) => {
      cell.alignment = { horizontal: "center" }
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      }
    })

    totalSum += order.totalPrice
  })

  // ردیف جمع کل
  sheet.addRow([])
  const sumRow = sheet.addRow(["", "", "", "", "", "جمع کل:", totalSum, ""])
  sumRow.eachCell((cell) => {
    cell.font = { bold: true }
    cell.alignment = { horizontal: "center" }
  })

  // تنظیم عرض ستون‌ها
  sheet.columns = [
    { width: 8 },
    { width: 18 },
    { width: 30 },
    { width: 20 },
    { width: 10 },
    { width: 18 },
    { width: 20 },
    { width: 15 },
  ]

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="sales-report.xlsx"`,
    },
  })
}