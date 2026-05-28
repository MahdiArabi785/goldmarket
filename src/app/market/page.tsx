import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { getProducts } from "@/server/product-actions"
import { ProductCard, ProductCardSkeleton } from "@/components/product-card"
import { MarketFilters } from "@/components/market-filters"
import { LiveGoldPrice } from "@/components/live-gold-price"
import { MarketSidebar } from "@/components/market-sidebar"

export const dynamic = "force-dynamic"

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; sort?: string; minWeight?: string; maxWeight?: string }>
}) {
  const session = await auth()
  const user = session?.user ? (session.user as any) : null

  // ▶▶▶ باز کردن Promise searchParams
  const params = await searchParams

  const products = await getProducts({
    type: params.type as any,
    minWeight: params.minWeight ? parseFloat(params.minWeight) : undefined,
    maxWeight: params.maxWeight ? parseFloat(params.maxWeight) : undefined,
    sortBy: params.sort as any,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-yellow-600">🏪 بازار طلا</h1>
          <LiveGoldPrice />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 shrink-0">
            <MarketSidebar user={user} />
          </aside>

          <main className="flex-1 min-w-0">
            <MarketFilters />

            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                  {[...Array(6)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                  <p className="text-5xl mb-4">💎</p>
                  <p className="text-xl text-gray-500">محصولی با این شرایط یافت نشد</p>
                  <p className="text-gray-400 mt-2">فیلترها را تغییر دهید</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}