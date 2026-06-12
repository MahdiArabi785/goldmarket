import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, parseImagesSafe } from "@/lib/utils"
import { Package, Weight, Gem, Barcode, User } from "lucide-react"
import Link from "next/link"

export default async function BarcodeResultPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  if (!code) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">کد بارکد نامعتبر است</p>
        <Link href="/dashboard/seller/barcode" className="text-yellow-600 hover:underline mt-4 block">
          بازگشت به اسکن بارکد
        </Link>
      </div>
    )
  }

  // جستجوی محصول بر اساس بارکد
  const product = await prisma.product.findFirst({
    where: { barcode: code },
    include: {
      seller: {
        select: { name: true, phone: true },
      },
    },
  })

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Barcode className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-xl text-gray-500 mb-2">محصولی با این بارکد یافت نشد</p>
        <p className="text-gray-400 mb-4">کد جستجو شده: {code}</p>
        <Link href="/dashboard/seller/barcode" className="text-yellow-600 hover:underline">
          جستجوی مجدد
        </Link>
      </div>
    )
  }

  const images = parseImagesSafe(product.images)

  const typeLabels: Record<string, string> = {
    NEW: "طلا نو",
    SECOND_HAND: "دست دوم",
    MELTED: "آب شده",
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/dashboard/seller/barcode" className="text-yellow-600 hover:underline mb-4 inline-block">
        ← بازگشت به اسکن بارکد
      </Link>

      <Card className="border-0 shadow-md">
        <CardHeader className="text-center bg-gradient-to-r from-yellow-50 to-amber-50 rounded-t-xl">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Barcode className="h-6 w-6" />
            اطلاعات محصول
          </CardTitle>
          <p className="text-sm text-gray-500">بارکد: {code}</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* تصویر و اطلاعات اصلی */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{product.name}</h2>
                <Badge className="mt-2 bg-yellow-500">{typeLabels[product.type]}</Badge>
                {product.isVerified && (
                  <Badge className="mt-2 mr-2 bg-emerald-500">✓ تأیید کارشناس</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Weight className="h-4 w-4" />
                  <span>وزن: {product.weight} گرم</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Gem className="h-4 w-4" />
                  <span>عیار: {product.karat}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Package className="h-4 w-4" />
                  <span>موجودی: {product.stock} عدد</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>فروشنده: {product.seller.name || product.seller.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* جدول قیمت */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-3">💰 جزئیات قیمت</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">قیمت پایه طلا</span>
                <span>{formatCurrency(product.weight * 20000000)} تومان</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">اجرت ساخت</span>
                <span>{formatCurrency(product.wage)} تومان</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">سود فروشنده ({product.profitPercent}٪)</span>
                <span>{formatCurrency((product.weight * 20000000 + product.wage) * product.profitPercent / 100)} تومان</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">مالیات (۹٪)</span>
                <span>{formatCurrency(product.finalPrice - (product.weight * 20000000 + product.wage) * (1 + product.profitPercent / 100))} تومان</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>قیمت نهایی</span>
                <span className="text-yellow-600">{formatCurrency(product.finalPrice)} تومان</span>
              </div>
            </div>
          </div>

          {product.description && (
            <div>
              <h3 className="font-bold text-lg mb-2">📝 توضیحات</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}