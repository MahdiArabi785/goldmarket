import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Wallet, ShoppingBag, TrendingUp, Package } from "lucide-react"
import Link from "next/link"

export default async function BuyerDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const userId = (session.user as any).id

  const [user, orders, walletTransactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.order.findMany({
      where: { buyerId: userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  const totalSpent = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalPrice, 0)

  const stats = [
    {
      title: "موجودی کیف پول",
      value: `${formatCurrency(user?.walletBalance || 0)} تومان`,
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
      value: `${orders.filter((o) => o.status !== "CANCELLED" && o.status !== "COMPLETED").length} عدد`,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">👋 سلام، {user?.name || "کاربر"}</h1>
        <p className="text-gray-600 mt-2">به داشبورد خریدار خوش آمدید</p>
      </div>

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/market" className="block p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors text-center font-medium">
          🛒 بازار طلا
        </Link>
        <Link href="/wallet" className="block p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center font-medium">
          💰 کیف پول
        </Link>
        <Link href="/analysis" className="block p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center font-medium">
          📈 تحلیل بازار
        </Link>
        <Link href="/dashboard/buyer/orders" className="block p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center font-medium">
          📦 سفارشات من
        </Link>
      </div>

      <Card className="border-0 shadow-md mb-8">
        <CardHeader>
          <CardTitle>سفارشات اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">هنوز سفارشی ثبت نکرده‌اید</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium">{order.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Intl.DateTimeFormat("fa-IR").format(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-yellow-600">{formatCurrency(order.totalPrice)} تومان</p>
                    <p className="text-sm text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}