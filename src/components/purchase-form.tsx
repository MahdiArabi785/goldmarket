"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { createOrder } from "@/server/order-actions"
import { Loader2, ShoppingCart, Minus, Plus } from "lucide-react"

interface PurchaseFormProps {
  productId: string
  finalPrice: number
  maxQuantity: number
}

export function PurchaseForm({ productId, finalPrice, maxQuantity }: PurchaseFormProps) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const totalPrice = finalPrice * quantity

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const order = await createOrder(productId, quantity)
      toast.success("خرید با موفقیت انجام شد! 🎉")
      router.push("/dashboard/buyer/orders")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "خطا در انجام خرید")
    }
    setLoading(false)
  }

  const incrementQuantity = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50/50">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">تکمیل خرید</h3>

        {/* انتخاب تعداد */}
        <div>
          <Label className="text-gray-600 mb-2 block">تعداد</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
              className="rounded-xl"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (val >= 1 && val <= maxQuantity) setQuantity(val)
              }}
              className="w-20 text-center text-lg font-bold rounded-xl"
              min={1}
              max={maxQuantity}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={incrementQuantity}
              disabled={quantity >= maxQuantity}
              className="rounded-xl"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            حداکثر {maxQuantity} عدد قابل خرید است
          </p>
        </div>

        {/* قیمت کل */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex justify-between items-baseline">
            <span className="text-gray-600">مبلغ قابل پرداخت:</span>
            <div className="text-left">
              <span className="text-2xl font-extrabold text-yellow-600">
                {formatCurrency(totalPrice)}
              </span>
              <span className="text-sm text-gray-500 mr-1">تومان</span>
            </div>
          </div>
        </div>

        {/* دکمه خرید */}
        <Button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full py-6 text-lg bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 shadow-lg"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <>
              <ShoppingCart className="ml-2 h-5 w-5" />
              پرداخت و خرید
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}