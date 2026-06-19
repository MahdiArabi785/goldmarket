import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { formatCurrency, parseImagesSafe } from "@/lib/utils"
import { Plus, Package, DollarSign, TrendingUp, AlertTriangle, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import { SecurityTimer } from "@/components/seller/security-timer"
import { AntiTheftSensor } from "@/components/seller/anti-theft-sensor"
import { LowStockAlert } from "@/components/seller/low-stock-alert"
import { SellerProfitLoss } from "@/components/seller/seller-profit-loss"

export default async function SellerDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id

  const [user, products, orders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.product.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: {
        product: { sellerId: userId },
        status: "COMPLETED",
      },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)
  const activeProducts = products.filter((p) => p.stock > 0).length
  const lowStockCount = products.filter((p) => p.stock <= 3 && p.stock > 0).length

  const stats = [
    {
      title: "درآمد کل",
      value: `${formatCurrency(totalRevenue)} تومان`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "محصولات فعال",
      value: `${activeProducts} عدد`,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "کل فروش",
      value: `${orders.length} سفارش`,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "موجودی کم",
      value: `${lowStockCount} محصول`,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* هدر */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">🏪 فروشگاه {user?.name || "شما"}</h1>
          <p className="text-gray-600 mt-2">داشبورد مدیریت فروشگاه</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/reports/sales" target="_blank">
            <Button variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              گزارش اکسل
            </Button>
          </a>
          <Link href="/dashboard/seller/barcode">
            <Button variant="outline" className="gap-2">
              📷 بارکدخوان
            </Button>
          </Link>
          <Link href="/dashboard/seller/products/new">
            <Button className="gap-2 bg-yellow-500 hover:bg-yellow-600">
              <Plus className="h-4 w-4" />
              محصول جدید
            </Button>
          </Link>
        </div>
      </div>

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ویجت‌های امنیتی */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <SecurityTimer />
        <AntiTheftSensor />
      </div>

      {/* هشدار موجودی کم */}
      <div className="mb-8">
        <LowStockAlert />
      </div>

      {/* سود و زیان لحظه‌ای */}
      <div className="mb-8">
        <SellerProfitLoss />
      </div>

      {/* لیست محصولات */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>محصولات شما</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">هنوز محصولی ثبت نکرده‌اید</p>
              <Link href="/dashboard/seller/products/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  افزودن اولین محصول
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => {
                const images = parseImagesSafe(product.images)
                const isLowStock = product.stock <= 3
                return (
                  <div
                    key={product.id}
                    className={`flex justify-between items-center p-4 rounded-xl transition-colors ${
                      isLowStock ? "bg-amber-50 border border-amber-200" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src={images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {product.name}
                          {isLowStock && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {product.stock === 0 ? "ناموجود" : "موجودی کم"}
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          موجودی: {product.stock} | {product.weight} گرم
                        </p>
                      </div>
                    </div>
                    <div className="text-left flex items-center gap-4">
                      <div>
                        <p className="font-bold text-yellow-600">
                          {formatCurrency(product.finalPrice)} تومان
                        </p>
                      </div>
                      <Link href={`/dashboard/seller/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                          ویرایش
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}