import { Suspense } from "react"
import { getProducts } from "@/server/product-actions"
import { ProductCard, ProductCardSkeleton } from "@/components/product-card"
import { MarketFilters } from "@/components/market-filters"
import { LiveGoldPrice } from "@/components/live-gold-price"

export const dynamic = "force-dynamic"

export default async function MarketPage({
  searchParams,
}: {
  searchParams: { type?: string; sort?: string; minWeight?: string; maxWeight?: string }
}) {
  const products = await getProducts({
    type: searchParams.type as any,
    minWeight: searchParams.minWeight ? parseFloat(searchParams.minWeight) : undefined,
    maxWeight: searchParams.maxWeight ? parseFloat(searchParams.maxWeight) : undefined,
    sortBy: searchParams.sort as any,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">بازار طلا</h1>
        <p className="text-gray-600">محصولات فروشندگان معتبر را مقایسه و خریداری کنید</p>
        <div className="mt-4">
          <LiveGoldPrice />
        </div>
      </div>

      <MarketFilters />

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-400 mb-4">😔</p>
            <p className="text-lg text-gray-500">محصولی با این شرایط یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  )
}