import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBuyerOrders } from "@/server/order-actions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CancelOrderButton } from "@/components/cancel-order-button"
import { FileText, ShoppingBag } from "lucide-react"
import Link from "next/link"

const STATUS_LABEL: Record<string, string> = {
  PENDING: "در انتظار",
  CONFIRMED: "تأیید شده",
  PREPARING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  COMPLETED: "تکمیل شده",
  CANCELLED: "لغو شده",
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const orders = await getBuyerOrders()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">📦 سفارشات من</h1>
        <p className="text-gray-600 mt-2">تاریخچه خریدهای شما</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 mb-4">هنوز سفارشی ثبت نکرده‌اید</p>
            <Link href="/market">
              <Button className="bg-yellow-500 hover:bg-yellow-600">مشاهده بازار</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* اطلاعات محصول */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {order.product.images?.[0] ? (
                          <img
                            src={typeof order.product.images === "string" ? JSON.parse(order.product.images)[0] : order.product.images[0]}
                            alt={order.product.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <span className="text-2xl">🪙</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{order.product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={STATUS_COLOR[order.status]}>
                            {STATUS_LABEL[order.status]}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>تعداد: {order.quantity} عدد</p>
                          <p>وزن: {order.product.weight} گرم</p>
                          {order.product.seller && (
                            <p>فروشنده: {order.product.seller.name || order.product.seller.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* قیمت و اقدامات */}
                  <div className="flex flex-col items-end justify-between gap-2">
                    <div className="text-left">
                      <p className="text-sm text-gray-500">مبلغ پرداختی</p>
                      <p className="text-2xl font-extrabold text-yellow-600">
                        {formatCurrency(order.totalPrice)}
                      </p>
                      <p className="text-sm text-gray-500">تومان</p>
                    </div>

                    <div className="flex gap-2">
                      {/* دکمه فاکتور */}
                      <Link href={`/api/invoice/${order.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-1">
                          <FileText className="h-4 w-4" />
                          فاکتور
                        </Button>
                      </Link>

                      {/* دکمه لغو سفارش */}
                      {(order.status === "PENDING" || order.status === "COMPLETED") && (
                        <CancelOrderButton orderId={order.id} />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}