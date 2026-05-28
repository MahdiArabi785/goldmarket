import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Check } from "lucide-react"

const plans = [
  {
    name: "پایه",
    price: "رایگان",
    period: "مادام‌العمر",
    features: [
      "دسترسی به بازار",
      "۳ محصول در علاقه‌مندی‌ها",
      "۱ هشدار قیمت",
      "پشتیبانی عادی",
    ],
    popular: false,
  },
  {
    name: "طلایی",
    price: "۴۹,۰۰۰",
    period: "ماهانه",
    features: [
      "همه امکانات پایه",
      "محصولات نامحدود در علاقه‌مندی‌ها",
      "۱۰ هشدار قیمت",
      "تحلیل تکنیکال پیشرفته",
      "پشتیبانی اولویت‌دار",
      "نشان ویژه در پروفایل",
    ],
    popular: true,
  },
  {
    name: "الماسی",
    price: "۱۹۹,۰۰۰",
    period: "ماهانه",
    features: [
      "همه امکانات طلایی",
      "هشدار قیمت نامحدود",
      "گزارش‌های اختصاصی بازار",
      "مشاوره سرمایه‌گذاری",
      "دعوت به رویدادهای ویژه",
      "پشتیبانی VIP",
    ],
    popular: false,
  },
]

export default async function SubscriptionPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Crown className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold">ارتقا به حساب ویژه</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          با خرید اشتراک ویژه از امکانات پیشرفته GoldMarket بهره‌مند شوید
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`border-0 shadow-md relative ${
              plan.popular ? "ring-2 ring-yellow-500 scale-105" : ""
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 right-4 bg-yellow-500 text-white">
                محبوب‌ترین
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-500 text-sm"> تومان</span>
              </div>
              <CardDescription className="text-sm mt-1">/{plan.period}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full mt-6 ${
                  plan.popular
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : plan.name === "پایه"
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-800 hover:bg-gray-900"
                }`}
                disabled={plan.name === "پایه"}
              >
                {plan.name === "پایه" ? "فعال است" : "خرید اشتراک"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}