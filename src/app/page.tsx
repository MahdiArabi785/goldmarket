import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Zap, TrendingUp, Users } from "lucide-react"
import { LiveGoldPrice } from "@/components/live-gold-price"
import { ProductCardSkeleton } from "@/components/product-card"

const features = [
  {
    icon: Shield,
    title: "معاملات امن و شفاف",
    description: "تمام معاملات با احراز هویت و تأیید کارشناسان انجام می‌شود",
  },
  {
    icon: Zap,
    title: "محاسبات خودکار",
    description: "اجرت، سود و مالیات به صورت خودکار و دقیق محاسبه می‌شود",
  },
  {
    icon: TrendingUp,
    title: "تحلیل بازار",
    description: "سیگنال‌های خرید و فروش بر اساس تحلیل تکنیکال و بنیادی",
  },
  {
    icon: Users,
    title: "رقابت فروشندگان",
    description: "مقایسه قیمت فروشندگان مختلف و انتخاب بهترین گزینه",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 animate-fade-in">
            🏪 GoldMarket
          </h1>
          <p className="text-2xl text-gray-700 mb-4 font-medium">
            بازار هوشمند معاملات طلا
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            خرید و فروش طلای نو، دست دوم و آب شده با شفافیت کامل
            قیمت‌گذاری خودکار، تحلیل بازار و احراز هویت امن
          </p>
          
          <div className="mb-8">
            <LiveGoldPrice />
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/market">
              <Button size="lg" className="text-lg px-8 py-6 bg-yellow-500 hover:bg-yellow-600 shadow-lg">
                مشاهده بازار
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                ورود / ثبت‌نام
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            چرا GoldMarket؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <feature.icon className="w-12 h-12 mx-auto text-yellow-500 mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            همین حالا شروع کنید
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            رایگان ثبت‌نام کنید و از بازار شفاف طلا لذت ببرید
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-lg px-10 py-6 bg-white text-yellow-600 hover:bg-gray-100">
              ورود به GoldMarket
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4 text-center">
          <p>© ۱۴۰۳ GoldMarket - تمام حقوق محفوظ است</p>
        </div>
      </footer>
    </div>
  )
}