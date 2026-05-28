"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminUpdateProduct } from "@/server/admin-actions"
import { prisma } from "@/lib/prisma" // for fetching product - we'll use server action instead

// We'll create a simple server action to get product
import { getProductById } from "@/server/product-actions" // assume exists or add inline

export default function AdminEditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [name, setName] = useState("")
  const [weight, setWeight] = useState("")
  const [wage, setWage] = useState("")
  const [profitPercent, setProfitPercent] = useState("")
  const [stock, setStock] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch product from API or server action
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data)
        setName(data.name)
        setWeight(data.weight.toString())
        setWage(data.wage.toString())
        setProfitPercent(data.profitPercent.toString())
        setStock(data.stock.toString())
      })
  }, [params.id])

  const handleSave = async () => {
    setLoading(true)
    try {
      await adminUpdateProduct(params.id, {
        name,
        weight: parseFloat(weight),
        wage: parseFloat(wage),
        profitPercent: parseFloat(profitPercent),
        stock: parseInt(stock),
      })
      toast.success("محصول به‌روزرسانی شد")
      router.push("/dashboard/admin/products")
    } catch (error: any) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  if (!product) return <div>در حال بارگذاری...</div>

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-6">✏️ ویرایش محصول</h1>
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات محصول</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>نام محصول</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>وزن (گرم)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div>
              <Label>اجرت (تومان)</Label>
              <Input type="number" value={wage} onChange={(e) => setWage(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>درصد سود</Label>
              <Input type="number" value={profitPercent} onChange={(e) => setProfitPercent(e.target.value)} />
            </div>
            <div>
              <Label>موجودی</Label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full bg-red-500 hover:bg-red-600">
            {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}