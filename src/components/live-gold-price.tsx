"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function LiveGoldPrice() {
  const [price, setPrice] = useState<number | null>(null)
  const [change, setChange] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("/api/gold-price")
        const data = await res.json()
        setPrice(data.price)
        setChange(data.change || 0)
      } catch {
        // استفاده از قیمت پیش‌فرض
        setPrice(20000000)
      }
      setLoading(false)
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 30000) // هر ۳۰ ثانیه
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="inline-block px-6 py-3 bg-yellow-50 border-0">
        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
      </Card>
    )
  }

  const isUp = change > 0
  const isDown = change < 0

  return (
    <Card className={`inline-block px-6 py-3 border-0 ${isUp ? "bg-green-50" : isDown ? "bg-red-50" : "bg-yellow-50"}`}>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">قیمت لحظه‌ای طلا ۱۸ عیار:</span>
        <span className={`text-xl font-bold tabular-nums ${isUp ? "text-green-600" : isDown ? "text-red-600" : "text-yellow-600"}`}>
          {price ? formatCurrency(price) : "---"}
        </span>
        <span className="text-sm text-gray-500">تومان</span>
        {isUp && <TrendingUp className="h-5 w-5 text-green-500" />}
        {isDown && <TrendingDown className="h-5 w-5 text-red-500" />}
        {!isUp && !isDown && <Minus className="h-5 w-5 text-gray-400" />}
      </div>
    </Card>
  )
}