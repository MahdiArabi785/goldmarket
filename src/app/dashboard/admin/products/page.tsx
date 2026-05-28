import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { adminGetAllProducts } from "@/server/admin-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Edit, Trash2 } from "lucide-react"
import { AdminDeleteProductButton } from "@/components/admin/admin-delete-product-button"

export default async function AdminProductsPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/login")

  const products = await adminGetAllProducts()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📦 مدیریت محصولات</h1>
        <Link href="/dashboard/seller/products/new">
          <Button className="gap-2 bg-red-500 hover:bg-red-600">محصول جدید</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام محصول</TableHead>
              <TableHead>فروشنده</TableHead>
              <TableHead>قیمت نهایی</TableHead>
              <TableHead>موجودی</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.seller.name || product.seller.phone}</TableCell>
                <TableCell>{formatCurrency(product.finalPrice)} تومان</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/dashboard/admin/products/${product.id}/edit`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AdminDeleteProductButton productId={product.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}