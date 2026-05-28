"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProduct } from "@/server/product-actions"

interface Product {
  id: string
  name: string
  weight: number
  karat: number
  wage: number
  profitPercent: number
  stock: number
  description: string | null
  type: string
  images: string[]
}

export function EditProductForm({ product }: { product: Product }) {
  const router = useRouter()
  const [name, setName] = useState(product.name)
  const [weight, setWeight] = useState(product.weight.toString())
  const [wage, setWage] = useState(product.wage.toString())
  const [profitPercent, setProfitPercent] = useState(product.profitPercent.toString())
  const [stock, setStock] = useState(product.stock.toString())
  const [description, setDescription] = useState(product.description || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append("name", name)
    formData.append("weight", weight)
    formData.append("wage", wage)
    formData.append("profitPercent", profitPercent)
    formData.append("stock", stock)
    formData.append("description", description)

    try {
      await updateProduct(product.id, formData)
      toast.success("محصول به‌روزرسانی شد")
      router.push("/dashboard/seller")
    } catch (error: any) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>اطلاعات محصول</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label>اجرت ساخت (تومان)</Label>
              <Input type="number" value={wage} onChange={(e) => setWage(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>درصد سود فروشنده</Label>
              <Input type="number" value={profitPercent} onChange={(e) => setProfitPercent(e.target.value)} />
            </div>
            <div>
              <Label>موجودی</Label>
              <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>توضیحات</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-gray-300 p-3 text-sm"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600">
            {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}