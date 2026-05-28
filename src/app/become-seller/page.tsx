import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, FileText, Check } from "lucide-react"

const steps = [
  {
    title: "تکمیل اطلاعات",
    description: "اطلاعات فروشگاه خود را تکمیل کنید",
    icon: FileText,
  },
  {
    title: "احراز هویت",
    description: "مدارک خود را برای تأیید ارسال کنید",
    icon: Check,
  },
  {
    title: "شروع فروش",
    description: "پس از تأیید، محصولات خود را ثبت کنید",
    icon: Store,
  },
]

export default async function BecomeSellerPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = session.user as any

  if (user.role === "SELLER") {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Store className="h-20 w-20 mx-auto text-yellow-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">شما قبلاً فروشنده هستید!</h1>
        <p className="text-gray-600 mb-6">به داشبورد فروشنده خود بروید</p>
        <a href="/dashboard/seller">
          <Button className="bg-yellow-500 hover:bg-yellow-600">داشبورد فروشنده</Button>
        </a>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-12">
        <Store className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold">ثبت طلافروشی</h1>
        <p className="text-gray-600 mt-2">
          فروشگاه طلای خود را در GoldMarket ثبت کنید و محصولات خود را بفروشید
        </p>
      </div>

      {/* مزایا */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-md text-center">
          <CardContent className="p-6">
            <p className="text-3xl mb-2">🛒</p>
            <p className="font-bold">دسترسی به هزاران خریدار</p>
            <p className="text-sm text-gray-500 mt-1">محصولات خود را به خریداران سراسر کشور عرضه کنید</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md text-center">
          <CardContent className="p-6">
            <p className="text-3xl mb-2">💰</p>
            <p className="font-bold">تسویه آنی</p>
            <p className="text-sm text-gray-500 mt-1">پس از هر فروش، مبلغ مستقیماً به کیف پول شما واریز می‌شود</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md text-center">
          <CardContent className="p-6">
            <p className="text-3xl mb-2">📊</p>
            <p className="font-bold">گزارش‌های فروش</p>
            <p className="text-sm text-gray-500 mt-1">گزارش‌های دقیق از فروش و سود خود دریافت کنید</p>
          </CardContent>
        </Card>
      </div>

      {/* مراحل */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>مراحل ثبت فروشگاه</CardTitle>
          <CardDescription>برای ثبت فروشگاه طلای خود، مراحل زیر را طی کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <step.icon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {index + 1}. {step.title}
                  </p>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full mt-8 bg-yellow-500 hover:bg-yellow-600 py-6 text-lg">
            شروع ثبت فروشگاه
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}