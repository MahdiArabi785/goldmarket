import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Users, Package, ShoppingBag, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/login")

  const [totalUsers, totalProducts, totalOrders, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalPrice: true }, where: { status: "COMPLETED" } }),
  ])

  const stats = [
    { title: "کاربران", value: totalUsers, icon: Users, href: "/dashboard/admin/users" },
    { title: "محصولات", value: totalProducts, icon: Package, href: "/dashboard/admin/products" },
    { title: "سفارشات", value: totalOrders, icon: ShoppingBag, href: "#" },
    {
      title: "درآمد کل",
      value: `${(totalRevenue._sum.totalPrice || 0).toLocaleString("fa-IR")} تومان`,
      icon: TrendingUp,
      href: "#",
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">🛡️ داشبورد مدیریت</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link href={stat.href} key={idx}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <stat.icon className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}