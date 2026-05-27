import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { PurchaseForm } from "@/components/purchase-form"
import { ProductImages } from "@/components/product-images"
import { PriceBreakdownDisplay } from "@/components/price-breakdown"
import { Shield, Weight, Gem, User } from "lucide-react"

const TYPE_LABEL: Record<string, string> = {
  NEW: "طلا نو",
  SECOND_HAND: "دست دوم",
  MELTED: "آب شده",
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth/login")

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      seller: {
        select: { name: true, phone: true, _count: { select: { products: true } } },
      },
    },
  })

  if (!product) notFound()

  const isSeller = (session.user as any).id === product.sellerId

  // محاسبه جزئیات قیمت
  const liveGoldPrice = 20000000 // قیمت پایه - در واقعیت از API گرفته می‌شود
  const rawPrice = product.weight * liveGoldPrice
  const profit = (rawPrice + product.wage) * (product.profitPercent / 100)
  const tax = (rawPrice + product.wage + profit) * 0.09

  const priceBreakdown = {
    rawPrice: Math.round(rawPrice),
    wage: product.wage,
    profit: Math.round(profit),
    tax: Math.round(tax),
    finalPrice: product.finalPrice,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* تصاویر محصول */}
        <div>
          <ProductImages images={product.images} name={product.name} />
        </div>

        {/* اطلاعات محصول */}
        <div className="space-y-6">
          {/* عنوان و نوع */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-yellow-500">{TYPE_LABEL[product.type]}</Badge>
              {product.isVerified && (
                <Badge className="bg-emerald-500">✓ تأیید کارشناس</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.description && (
              <p className="text-gray-600 mt-2">{product.description}</p>
            )}
          </div>

          {/* فروشنده */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{product.seller.name || "فروشنده"}</p>
                  <p className="text-sm text-gray-500">
                    {product.seller._count.products} محصول فعال
                  </p>
                </div>
                {product.isVerified && (
                  <Shield className="h-5 w-5 text-emerald-500 mr-auto" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* مشخصات فنی */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">مشخصات محصول</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">وزن</span>
                </div>
                <span className="font-bold">{product.weight} گرم</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2">
                  <Gem className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">عیار</span>
                </div>
                <span className="font-bold">{product.karat}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">موجودی</span>
                {product.stock > 0 ? (
                  <span className="font-bold text-green-600">{product.stock} عدد</span>
                ) : (
                  <span className="font-bold text-red-600">ناموجود</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* جزئیات قیمت */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">جزئیات قیمت</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceBreakdownDisplay breakdown={priceBreakdown} />
            </CardContent>
          </Card>

          {/* خرید */}
          {!isSeller && product.stock > 0 && (
            <PurchaseForm productId={product.id} finalPrice={product.finalPrice} maxQuantity={product.stock} />
          )}

          {isSeller && (
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4 text-center">
                <p className="text-yellow-700">این محصول متعلق به شماست</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}