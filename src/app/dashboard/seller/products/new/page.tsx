"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { createProduct } from "@/server/product-actions"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { Loader2, Save, Plus, X, Upload } from "lucide-react"

export default function NewProductPage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"manual" | "barcode">("manual")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newUrl, setNewUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

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

  // حذف URL
  const removeUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // آپلود فایل
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("فقط تصاویر مجاز هستند")
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

  // Server Action اصلی
  async function submitProduct(formData: FormData) {
    // افزودن تصاویر به FormData
    formData.append("imageUrls", JSON.stringify(imageUrls))

    setLoading(true)
    try {
      await createProduct(formData)
      toast.success("محصول با موفقیت ثبت شد! 🎉")
      router.push("/dashboard/seller")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "خطا در ثبت محصول")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">➕ افزودن محصول جدید</h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "manual" | "barcode")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">ثبت دستی</TabsTrigger>
          <TabsTrigger value="barcode">اسکن بارکد</TabsTrigger>
        </TabsList>

        <TabsContent value="barcode">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <BarcodeScanner
                onScan={(barcode) => {
                  // پر کردن فیلد بارکد در فرم
                  const barcodeInput = document.querySelector('input[name="barcode"]') as HTMLInputElement
                  if (barcodeInput) {
                    barcodeInput.value = barcode
                    toast.success(`بارکد ${barcode} شناسایی شد`)
                  }
                  setActiveTab("manual")
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>اطلاعات محصول</CardTitle>
            </CardHeader>
            <CardContent>
              <form ref={formRef} action={submitProduct} className="space-y-4">
                {/* نام محصول */}
                <div>
                  <Label>نام محصول *</Label>
                  <Input name="name" placeholder="مثال: گردنبند طلا ۱۸ عیار" required />
                </div>

                {/* نوع طلا */}
                <div>
                  <Label>نوع طلا *</Label>
                  <Select name="type" defaultValue="NEW">
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب نوع طلا" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">طلا نو</SelectItem>
                      <SelectItem value="SECOND_HAND">طلا دست دوم</SelectItem>
                      <SelectItem value="MELTED">طلا آب شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* وزن و عیار */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>وزن (گرم) *</Label>
                    <Input name="weight" type="number" step="0.01" min="0.01" placeholder="۵.۵" required />
                  </div>
                  <div>
                    <Label>عیار</Label>
                    <Input name="karat" type="number" min="1" max="24" defaultValue={18} />
                  </div>
                </div>

                {/* اجرت و سود */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اجرت ساخت (تومان)</Label>
                    <Input name="wage" type="number" min="0" defaultValue={0} />
                  </div>
                  <div>
                    <Label>درصد سود فروشنده</Label>
                    <Input name="profitPercent" type="number" step="0.1" min="0" max="100" defaultValue={7} />
                  </div>
                </div>

                {/* موجودی و بارکد */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>موجودی</Label>
                    <Input name="stock" type="number" min="0" defaultValue={1} />
                  </div>
                  <div>
                    <Label>بارکد (اختیاری)</Label>
                    <Input name="barcode" placeholder="کد بارکد" />
                  </div>
                </div>

                {/* توضیحات */}
                <div>
                  <Label>توضیحات</Label>
                  <Textarea name="description" placeholder="توضیحات تکمیلی..." rows={4} />
                </div>

                {/* تصاویر */}
                <div>
                  <Label>تصاویر محصول</Label>
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
                      placeholder="آدرس تصویر..."
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={addUrl}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-2">
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Upload className="h-4 w-4" />
                      یا آپلود فایل تصویر
                    </Label>
                    <input
                      id="file-upload"
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

                  {imageUrls.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
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
                  {imageUrls.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">تصویری اضافه نشده؛ از تصویر پیش‌فرض استفاده می‌شود.</p>
                  )}
                </div>

                {/* دکمه ثبت */}
                <Button type="submit" disabled={loading} className="w-full py-6 text-lg bg-yellow-500 hover:bg-yellow-600">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 ml-2" />
                      در حال ثبت...
                    </>
                  ) : (
                    <>
                      <Save className="ml-2 h-5 w-5" />
                      ثبت محصول
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}