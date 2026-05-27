import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"

interface PriceBreakdownProps {
  breakdown: {
    rawPrice: number
    wage: number
    profit: number
    tax: number
    finalPrice: number
  }
}

export function PriceBreakdownDisplay({ breakdown }: PriceBreakdownProps) {
  const items = [
    { label: "قیمت خام طلا", value: breakdown.rawPrice, color: "text-gray-600" },
    { label: "اجرت ساخت", value: breakdown.wage, color: "text-blue-600" },
    { label: "سود فروشنده", value: breakdown.profit, color: "text-green-600" },
    { label: "مالیات (۹٪)", value: breakdown.tax, color: "text-orange-600" },
  ]

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-gray-600">{item.label}</span>
          <span className={`font-medium ${item.color}`}>
            {formatCurrency(item.value)} تومان
          </span>
        </div>
      ))}
      <Separator className="my-2" />
      <div className="flex justify-between items-center pt-2">
        <span className="text-lg font-bold text-gray-900">قیمت نهایی</span>
        <span className="text-2xl font-extrabold text-yellow-600">
          {formatCurrency(breakdown.finalPrice)}
        </span>
        <span className="text-sm text-gray-500">تومان</span>
      </div>
    </div>
  )
}