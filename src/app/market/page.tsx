import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product-card'
import { SearchFilters } from '@/components/search-filters'

export const dynamic = 'force-dynamic'

export default async function MarketPage({
  searchParams
}: {
  searchParams: { type?: string; minWeight?: string; maxWeight?: string; sort?: string }
}) {
  const products = await prisma.product.findMany({
    where: {
      type: searchParams.type as any,
      weight: {
        gte: searchParams.minWeight ? parseFloat(searchParams.minWeight) : undefined,
        lte: searchParams.maxWeight ? parseFloat(searchParams.maxWeight) : undefined
      }
    },
    orderBy: {
      finalPrice: searchParams.sort === 'price_asc' ? 'asc' : 'desc'
    },
    include: { seller: true }
  })

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">بازار طلا</h1>
      <SearchFilters />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}