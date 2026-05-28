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
    return <div className="p-8 text-center text-gray-500">محصول یافت نشد یا شما مجاز به ویرایش نیستید</div>
  }

  // images را پارس کرده و به فرم ارسال می‌کنیم
  const plainProduct = {
    ...product,
    images: JSON.parse(product.images),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">✏️ ویرایش محصول</h1>
      <EditProductForm product={plainProduct} />
    </div>
  )
}