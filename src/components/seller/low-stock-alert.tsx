import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

export async function LowStockAlert() {
  const session = await auth()
  if (!session?.user) return null

  const sellerId = (session.user as any).id

  const lowStockProducts = await prisma.product.findMany({
    where: {
      sellerId,
      stock: { lte: 3 },
    },
    orderBy: { stock: "asc" },
    take: 5,
  })

  if (lowStockProducts.length === 0) return null

  return (
    <Card className="border-0 shadow-md bg-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-700">
          <AlertTriangle className="h-5 w-5" />
          هشدار موجودی کم
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lowStockProducts.map((product) => (
            <div key={product.id} className="flex justify-between items-center p-2 bg-white rounded-lg">
              <span className="text-sm font-medium truncate">{product.name}</span>
              <Badge className={product.stock === 0 ? "bg-red-500" : "bg-amber-500"}>
                {product.stock === 0 ? "ناموجود" : `${product.stock} عدد`}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}