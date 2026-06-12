// src/components/seller/edit-product-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { updateProduct } from "@/server/product-actions"
import { Plus, X, Upload, Loader2, Save } from "lucide-react"

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
  
  // مدیریت تصاویر
  const [imageUrls, setImageUrls] = useState<string[]>(product.images || [])
  const [newUrl, setNewUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  // افزودن URL به لیست
  const addUrl = () => {
    const trimmed = newUrl.trim()
    if (!trimmed) return
    if (imageUrls.includes(trimmed)) {
      toast.error("این آدرس قبلاً اضافه شده است")
      return
    }
    setImageUrls((prev) => [...prev, trimmed])
    setNewUrl("")
  }

  // حذف URL از لیست
  const removeUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // آپلود فایل تصویر
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل‌های تصویری مجاز هستند")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم فایل نباید بیشتر از ۵ مگابایت باشد")
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "خطا در آپلود" }))
        throw new Error(err.error || "خطا")
      }
      const data = await res.json()
      setImageUrls((prev) => [...prev, data.url])
      toast.success("تصویر آپلود شد")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  // ثبت تغییرات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("weight", weight)
      formData.append("wage", wage)
      formData.append("profitPercent", profitPercent)
      formData.append("stock", stock)
      formData.append("description", description)
      formData.append("barcode", barcode)

      // ارسال تصاویر جدید
      const finalImages = imageUrls.length > 0 ? imageUrls : ["/placeholder.svg"]
      formData.append("imageUrls", JSON.stringify(finalImages))

      await updateProduct(product.id, formData)
      toast.success("محصول با موفقیت ویرایش شد! ✏️")
      router.push("/dashboard/seller")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "خطا در ویرایش محصول")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ویرایش محصول</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* نام محصول */}
          <div>
            <Label>نام محصول</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="نام محصول" required />
          </div>

          {/* وزن و اجرت */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>وزن (گرم)</Label>
              <Input type="number" step="0.01" min="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div>
              <Label>اجرت ساخت (تومان)</Label>
              <Input type="number" min="0" value={wage} onChange={(e) => setWage(e.target.value)} />
            </div>
          </div>

          {/* سود و موجودی */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>درصد سود فروشنده</Label>
              <Input type="number" step="0.1" min="0" max="100" value={profitPercent} onChange={(e) => setProfitPercent(e.target.value)} />
            </div>
            <div>
              <Label>موجودی</Label>
              <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>

          {/* بارکد */}
          <div>
            <Label>بارکد</Label>
            <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="کد بارکد" />
          </div>

          {/* توضیحات */}
          <div>
            <Label>توضیحات</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیحات محصول..." rows={4} />
          </div>

          {/* بخش مدیریت تصاویر */}
          <div>
            <Label>تصاویر محصول</Label>

            {/* افزودن URL جدید */}
            <div className="flex gap-2 mt-2">
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addUrl()
                  }
                }}
                placeholder="آدرس تصویر جدید..."
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addUrl}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* آپلود فایل */}
            <div className="mt-2">
              <Label htmlFor="edit-file-upload" className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
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
              {uploading && (
                <span className="text-xs text-gray-500 mr-2 inline-flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  در حال آپلود...
                </span>
              )}
            </div>

            {/* پیش‌نمایش و حذف تصاویر */}
            {imageUrls.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt={`تصویر ${idx + 1}`} className="w-full h-full object-cover" />
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
            ) : (
              <p className="text-xs text-gray-500 mt-1">تصویری وجود ندارد. حداقل یک تصویر اضافه کنید.</p>
            )}
          </div>

          {/* دکمه ذخیره */}
          <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600">
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 ml-2" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                ذخیره تغییرات
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}