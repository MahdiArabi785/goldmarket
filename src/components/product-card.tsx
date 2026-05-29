import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, parseImagesSafe } from "@/lib/utils"
import { Heart } from "lucide-react"

const TYPE_LABEL: Record<string, string> = {
  NEW: "طلا نو",
  SECOND_HAND: "دست دوم",
  MELTED: "آب شده",
}

const TYPE_COLOR: Record<string, string> = {
  NEW: "bg-blue-500",
  SECOND_HAND: "bg-purple-500",
  MELTED: "bg-orange-500",
}

export function ProductCard({ product }: { product: any }) {
  const images = parseImagesSafe(product.images)
  const isLowStock = product.stock <= 3 && product.stock > 0
  const isOutOfStock = product.stock === 0

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Badge className={`${TYPE_COLOR[product.type]} text-white border-0`}>
            {TYPE_LABEL[product.type]}
          </Badge>
          {product.isVerified && (
            <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white border-0">
              ✓ تأیید کارشناس
            </Badge>
          )}
        </div>

        <button className="absolute top-3 left-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white">
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xl font-bold">ناموجود</span>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-lg truncate" title={product.name}>
            {product.name}
          </h3>
          {product.seller && (
            <p className="text-sm text-gray-500 truncate">
              فروشنده: {product.seller.name || product.seller.phone}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-1">
            <span>⚖️</span>
            <span>{product.weight} گرم</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔨</span>
            <span>{formatCurrency(product.wage)} تومان</span>
          </div>
        </div>

        {isLowStock && (
          <p className="text-amber-600 text-xs mb-2 text-center font-medium">
            ⚡ فقط {product.stock} عدد باقی مانده
          </p>
        )}

        <Separator className="my-3" />

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">قیمت نهایی</p>
            <span className="text-2xl font-extrabold text-yellow-600 tabular-nums">
              {formatCurrency(product.finalPrice)}
            </span>
            <span className="text-sm text-gray-500 mr-1">تومان</span>
          </div>
          <span className="text-xs text-gray-400">سود {product.profitPercent}٪</span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        {isOutOfStock ? (
          <Button className="w-full" disabled variant="outline">
            ناموجود
          </Button>
        ) : (
          <Link href={`/dashboard/buyer/products/${product.id}`} className="w-full">
            <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all">
              مشاهده و خرید
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card className="rounded-2xl border-0 shadow-md overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3 mt-4" />
      </div>
    </Card>
  )
}