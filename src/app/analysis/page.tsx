// src/app/analysis/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTechnicalAnalysis } from "@/server/analysis-actions"
import { getPriceHistory } from "@/server/price-actions"
import { GoldPriceChart } from "@/components/charts/gold-price-chart"
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AnalysisPage() {
  const [analysis, priceHistory] = await Promise.all([
    getTechnicalAnalysis(),
    getPriceHistory(30),
  ])

  const signalConfig = {
    BUY: {
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      label: "خرید",
      badgeColor: "bg-green-500",
    },
    SELL: {
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
      label: "فروش",
      badgeColor: "bg-red-500",
    },
    HOLD: {
      icon: Minus,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      label: "منتظر بمانید",
      badgeColor: "bg-yellow-500",
    },
  }

  const config = signalConfig[analysis.type]
  const Icon = config.icon

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">📈 تحلیل بازار</h1>
        <p className="text-gray-600 mt-2">سیگنال‌های خرید و فروش بر اساس تحلیل تکنیکال</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className={`border-0 shadow-md ${config.bg} lg:col-span-1`}>
          <CardContent className="p-8 text-center">
            <Icon className={`w-16 h-16 mx-auto mb-4 ${config.color}`} />
            <Badge className={`${config.badgeColor} text-white text-lg px-6 py-2 mb-4`}>
              {config.label}
            </Badge>
            <p className="text-2xl font-bold mb-2">
              قدرت سیگنال: {analysis.strength}٪
            </p>
            <p className="text-gray-600">{analysis.reason}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-500" />
              نمودار قیمت طلا (۳۰ روز اخیر)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoldPriceChart data={priceHistory} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>تحلیل تکنیکال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>امتیاز تکنیکال</span>
                <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      analysis.technicalScore >= 70
                        ? "bg-green-500"
                        : analysis.technicalScore >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${analysis.technicalScore}%` }}
                  />
                </div>
                <span className="font-bold">{analysis.technicalScore}/۱۰۰</span>
              </div>
              <div className="flex justify-between items-center">
                <span>امتیاز بنیادی</span>
                <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${analysis.fundamentalScore}%` }}
                  />
                </div>
                <span className="font-bold">{analysis.fundamentalScore}/۱۰۰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>نکات مهم</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">⚠️</span>
                <span>این سیگنال‌ها صرفاً بر اساس داده‌های تاریخی محاسبه می‌شوند و به معنای پیش‌بینی قطعی نیستند.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">ℹ️</span>
                <span>برای تصمیم‌گیری بهتر، تحلیل تکنیکال را با اخبار اقتصادی ترکیب کنید.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">💡</span>
                <span>می‌توانید هشدار قیمت تنظیم کنید تا در زمان مناسب مطلع شوید.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}