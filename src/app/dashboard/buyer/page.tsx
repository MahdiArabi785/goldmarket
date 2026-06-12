import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Wallet, ShoppingBag, Package, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { LiveProfitLoss } from "@/components/live-profit-loss"

export default async function BuyerDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { product: true },
      },
    },
  })

  if (!user) redirect("/login")

  const totalSpent = user.orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalPrice, 0)

  const activeOrders = user.orders.filter(
    (o) => o.status !== "CANCELLED" && o.status !== "COMPLETED"
  ).length

  const stats = [
    {
      title: "موجودی کیف پول",
      value: `${formatCurrency(user.walletBalance)} تومان`,
      icon: Wallet,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "کل خریدها",
      value: `${formatCurrency(totalSpent)} تومان`,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "سفارشات فعال",
      value: `${activeOrders} عدد`,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ]

  const quickLinks = [
    { href: "/market", label: "🛒 بازار طلا", bg: "bg-yellow-50 hover:bg-yellow-100" },
    { href: "/wallet", label: "💰 کیف پول", bg: "bg-green-50 hover:bg-green-100" },
    { href: "/analysis", label: "📈 تحلیل بازار", bg: "bg-blue-50 hover:bg-blue-100" },
    { href: "/favorites", label: "❤️ علاقه‌مندی‌ها", bg: "bg-red-50 hover:bg-red-100" },
    { href: "/subscription", label: "👑 اشتراک ویژه", bg: "bg-purple-50 hover:bg-purple-100" },
    { href: "/become-seller", label: "🏪 ثبت طلافروشی", bg: "bg-amber-50 hover:bg-amber-100" },
    { href: "/dashboard/buyer/report-stolen", label: "🚨 گزارش طلای سرقتی", bg: "bg-red-100 hover:bg-red-200" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">👋 سلام، {user.name || "کاربر"}</h1>
        <p className="text-gray-600 mt-2">به داشبورد خریدار خوش آمدید</p>
      </div>

      {/* کارت سود و زیان لحظه‌ای */}
      <div className="mb-8">
        <LiveProfitLoss userId={userId} />
      </div>

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      {/* لینک‌های سریع */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className={`block p-4 rounded-xl ${link.bg} transition-colors text-center font-medium text-sm`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* سفارشات اخیر */}
      <Card className="border-0 shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">سفارشات اخیر</h2>
          {user.orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">هنوز سفارشی ثبت نکرده‌اید</p>
              <Link href="/market">
                <Button className="bg-yellow-500 hover:bg-yellow-600">مشاهده بازار</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {user.orders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium">{order.product?.name || "محصول"}</p>
                    <p className="text-sm text-gray-500">
                      {new Intl.DateTimeFormat("fa-IR").format(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-yellow-600">
                      {formatCurrency(order.totalPrice)} تومان
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}