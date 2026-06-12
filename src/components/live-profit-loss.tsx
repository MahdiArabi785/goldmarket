"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface LiveProfitLossProps {
  userId: string
}

export function LiveProfitLoss({ userId }: LiveProfitLossProps) {
  const [profitLoss, setProfitLoss] = useState<{
    totalInvested: number
    currentValue: number
    profit: number
    percentage: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfitLoss() {
      try {
        const res = await fetch(`/api/profit-loss?userId=${userId}`)
        const data = await res.json()
        setProfitLoss(data)
      } catch (error) {
        console.error("Error fetching profit/loss:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfitLoss()
    const interval = setInterval(fetchProfitLoss, 30000) // هر ۳۰ ثانیه
    return () => clearInterval(interval)
  }, [userId])

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="h-16 bg-gray-200 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!profitLoss) return null

  const isPositive = profitLoss.profit > 0
  const isNeutral = profitLoss.profit === 0

  return (
    <Card className={`border-0 shadow-md ${isPositive ? "bg-green-50" : isNeutral ? "bg-gray-50" : "bg-red-50"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">ارزش فعلی دارایی</p>
            <p className="text-xl font-bold">{formatCurrency(profitLoss.currentValue)} تومان</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">سود/زیان</p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : isNeutral ? (
                <Minus className="h-5 w-5 text-gray-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <span className={`text-xl font-bold ${isPositive ? "text-green-600" : isNeutral ? "text-gray-600" : "text-red-600"}`}>
                {formatCurrency(Math.abs(profitLoss.profit))} تومان
              </span>
            </div>
            <p className={`text-sm ${isPositive ? "text-green-600" : isNeutral ? "text-gray-600" : "text-red-600"}`}>
              ({profitLoss.percentage > 0 ? "+" : ""}{profitLoss.percentage.toFixed(2)}٪)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}