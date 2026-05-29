import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditProductForm } from "@/components/seller/edit-product-form"

export default async function SellerEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product || product.sellerId !== (session.user as any).id) {
    return (
      <div className="p-8 text-center text-gray-500">
        محصول یافت نشد یا شما مجاز به ویرایش نیستید
      </div>
    )
  }

  // تبدیل images به آرایه
  const images: string[] = JSON.parse(product.images)

  const plainProduct = {
    id: product.id,
    name: product.name,
    type: product.type,
    weight: product.weight,
    karat: product.karat,
    wage: product.wage,
    profitPercent: product.profitPercent,
    stock: product.stock,
    description: product.description || "",
    barcode: product.barcode || "",
    images,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">✏️ ویرایش محصول</h1>
      <EditProductForm product={plainProduct} />
    </div>
  )
}