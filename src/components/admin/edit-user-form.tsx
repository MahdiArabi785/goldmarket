"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProduct } from "@/server/product-actions"
import { Plus, X, Upload } from "lucide-react"

interface Product {
  id: string
  name: string
  type: string
  weight: number
  karat: number
  wage: number
  profitPercent: number
  stock: number
  description: string
  barcode: string
  images: string[]
}

export function EditProductForm({ product }: { product: Product }) {
  const router = useRouter()
  const [name, setName] = useState(product.name)
  const [weight, setWeight] = useState(product.weight.toString())
  const [wage, setWage] = useState(product.wage.toString())
  const [profitPercent, setProfitPercent] = useState(product.profitPercent.toString())
  const [stock, setStock] = useState(product.stock.toString())
  const [description, setDescription] = useState(product.description)
  const [barcode, setBarcode] = useState(product.barcode || "")
  const [imageUrls, setImageUrls] = useState<string[]>(product.images || [])
  const [newUrl, setNewUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  const addUrl = () => {
    if (newUrl.trim()) {
      setImageUrls([...imageUrls, newUrl.trim()])
      setNewUrl("")
    }
  }

  const removeUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("خطا در آپلود")

      const data = await res.json()
      setImageUrls([...imageUrls, data.url])
      toast.success("تصویر آپلود شد")
    } catch (error: any) {
      toast.error(error.message || "خطا در آپلود تصویر")
    } finally {
      setUploading(false)
    }
  }

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
    formData.append("barcode", barcode)

    // ارسال تصاویر
    const finalImages = imageUrls.length > 0 ? imageUrls : ["https://via.placeholder.com/400"]
    formData.append("imageUrls", JSON.stringify(finalImages))

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
            <Label>بارکد</Label>
            <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          </div>
          <div>
            <Label>توضیحات</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-gray-300 p-3 text-sm"
            />
          </div>

          {/* بخش تصاویر */}
          <div>
            <Label>تصاویر محصول</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="آدرس تصویر..."
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addUrl}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-2">
              <Label htmlFor="edit-file-upload" className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600">
                <Upload className="h-4 w-4" />
                یا آپلود فایل جدید
              </Label>
              <input
                id="edit-file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>

            {imageUrls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeUrl(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600">
            {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}