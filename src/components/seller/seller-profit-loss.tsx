"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Store } from "lucide-react"

interface SellerProfitLossData {
  totalWeight: number
  totalInventoryValue: number
  totalCost: number
  profit: number
  percentage: number
  products: {
    id: string
    name: string
    weight: number
    stock: number
    currentValue: number
    cost: number
    profit: number
    percentage: number
  }[]
}

export function SellerProfitLoss() {
  const [data, setData] = useState<SellerProfitLossData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/seller-profit-loss")
        const json = await res.json()
        if (!json.error) {
          setData(json)
        }
      } catch (error) {
        console.error("Error fetching seller profit/loss:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // هر ۳۰ ثانیه
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="h-24 bg-gray-200 animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const isPositive = data.profit > 0
  const isNeutral = data.profit === 0

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Store className="h-5 w-5 text-yellow-600" />
          سود و زیان لحظه‌ای موجودی
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* خلاصه کل */}
        <div className={`rounded-xl p-4 ${isPositive ? "bg-green-50" : isNeutral ? "bg-gray-50" : "bg-red-50"}`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ارزش لحظه‌ای موجودی</p>
              <p className="text-xl font-bold">{formatCurrency(data.totalInventoryValue)} تومان</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">سود/زیان کل</p>
              <div className="flex items-center justify-end gap-1">
                {isPositive ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : isNeutral ? (
                  <Minus className="h-5 w-5 text-gray-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-xl font-bold ${isPositive ? "text-green-600" : isNeutral ? "text-gray-600" : "text-red-600"}`}>
                  {formatCurrency(Math.abs(data.profit))} تومان
                </span>
              </div>
              <p className={`text-sm ${isPositive ? "text-green-600" : isNeutral ? "text-gray-600" : "text-red-600"}`}>
                ({data.percentage > 0 ? "+" : ""}{data.percentage}٪)
              </p>
            </div>
          </div>
        </div>

        {/* جزئیات هر محصول */}
        {data.products.length > 0 && (
          <div>
            <h3 className="font-bold text-sm text-gray-600 mb-3">جزئیات محصولات</h3>
            <div className="space-y-2">
              {data.products.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.stock} عدد | {product.weight} گرم
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(product.currentValue)} تومان</p>
                    <Badge className={`text-xs ${product.profit > 0 ? "bg-green-100 text-green-700" : product.profit < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                      {product.profit > 0 ? "+" : ""}{formatCurrency(product.profit)} تومان
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}