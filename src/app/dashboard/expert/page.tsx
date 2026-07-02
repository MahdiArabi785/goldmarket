// src/app/dashboard/expert/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { ExpertRequestCard } from "@/components/expert-request-card"
import { Shield, Clock, CheckCircle, XCircle } from "lucide-react"

export default async function ExpertDashboard() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as any).id
  const role = (session.user as any).role

  // فقط کارشناس یا ادمین می‌توانند وارد این صفحه شوند
  if (role !== "EXPERT" && role !== "ADMIN") {
    redirect("/dashboard/buyer")
  }

  // دریافت درخواست‌های در حال بررسی
  const pendingRequests = await prisma.expertRequest.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  })

  // تعداد تأیید شده‌ها و رد شده‌ها
  const [approvedCount, rejectedCount] = await Promise.all([
    prisma.expertRequest.count({ where: { reviewedBy: userId, status: "APPROVED" } }),
    prisma.expertRequest.count({ where: { reviewedBy: userId, status: "REJECTED" } }),
  ])

  const stats = [
    {
      title: "در انتظار بررسی",
      value: `${pendingRequests.length} درخواست`,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "تأیید شده",
      value: `${approvedCount} مورد`,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "رد شده",
      value: `${rejectedCount} مورد`,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-yellow-500" />
          پنل کارشناسی
        </h1>
        <p className="text-gray-600 mt-2">بررسی و تأیید طلاهای دست دوم</p>
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

      {/* درخواست‌های در انتظار بررسی */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>درخواست‌های در انتظار بررسی</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">درخواستی در انتظار بررسی نیست</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <ExpertRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}