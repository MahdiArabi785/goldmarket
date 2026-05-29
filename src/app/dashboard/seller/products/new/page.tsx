"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createProduct } from "@/server/product-actions"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { Loader2, Save, Plus, X, Upload } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(3, "نام محصول حداقل ۳ کاراکتر است"),
  type: z.enum(["NEW", "SECOND_HAND", "MELTED"]),
  weight: z.string().min(1, "وزن الزامی است"),
  karat: z.string().default("18"),
  wage: z.string().default("0"),
  profitPercent: z.string().default("7"),
  stock: z.string().default("1"),
  description: z.string().optional(),
  barcode: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

export default function NewProductPage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"manual" | "barcode">("manual")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newUrl, setNewUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      type: "NEW",
      weight: "",
      karat: "18",
      wage: "0",
      profitPercent: "7",
      stock: "1",
      description: "",
      barcode: "",
    },
  })

  // افزودن URL به لیست
  const addUrl = () => {
    if (newUrl.trim()) {
      setImageUrls([...imageUrls, newUrl.trim()])
      setNewUrl("")
    }
  }

  // حذف URL از لیست
  const removeUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  // آپلود فایل تصویر
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

  // ثبت نهایی محصول
  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("type", data.type)
      formData.append("weight", data.weight)
      formData.append("karat", data.karat)
      formData.append("wage", data.wage)
      formData.append("profitPercent", data.profitPercent)
      formData.append("stock", data.stock)
      if (data.description) formData.append("description", data.description)
      if (data.barcode) formData.append("barcode", data.barcode)

      // ارسال آرایه تصاویر به صورت JSON
      const finalImages = imageUrls.length > 0 ? imageUrls : ["https://via.placeholder.com/400"]
      formData.append("imageUrls", JSON.stringify(finalImages))

      await createProduct(formData)
      toast.success("محصول با موفقیت ثبت شد! 🎉")
      router.push("/dashboard/seller")
    } catch (error: any) {
      toast.error(error.message || "خطا در ثبت محصول")
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">➕ افزودن محصول جدید</h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">ثبت دستی</TabsTrigger>
          <TabsTrigger value="barcode">اسکن بارکد</TabsTrigger>
        </TabsList>

        <TabsContent value="barcode">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <BarcodeScanner
                onScan={(barcode) => {
                  form.setValue("barcode", barcode)
                  toast.success(`بارکد ${barcode} شناسایی شد`)
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* نام محصول */}
                <div>
                  <Label>نام محصول *</Label>
                  <Input {...form.register("name")} placeholder="مثال: گردنبند طلا ۱۸ عیار" />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {/* نوع طلا */}
                <div>
                  <Label>نوع طلا *</Label>
                  <Select
                    onValueChange={(v) => form.setValue("type", v as any)}
                    defaultValue="NEW"
                  >
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
                    <Input {...form.register("weight")} type="number" step="0.01" placeholder="۵.۵" />
                  </div>
                  <div>
                    <Label>عیار</Label>
                    <Input {...form.register("karat")} type="number" placeholder="۱۸" />
                  </div>
                </div>

                {/* اجرت و سود */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اجرت ساخت (تومان)</Label>
                    <Input {...form.register("wage")} type="number" placeholder="۰" />
                  </div>
                  <div>
                    <Label>درصد سود فروشنده</Label>
                    <Input {...form.register("profitPercent")} type="number" step="0.1" placeholder="۷" />
                  </div>
                </div>

                {/* موجودی و بارکد */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>موجودی</Label>
                    <Input {...form.register("stock")} type="number" placeholder="۱" />
                  </div>
                  <div>
                    <Label>بارکد (اختیاری)</Label>
                    <Input {...form.register("barcode")} placeholder="کد بارکد" />
                  </div>
                </div>

                {/* توضیحات */}
                <div>
                  <Label>توضیحات</Label>
                  <textarea
                    {...form.register("description")}
                    className="w-full min-h-[100px] rounded-xl border border-gray-300 p-3 text-sm"
                    placeholder="توضیحات تکمیلی..."
                  />
                </div>

                {/* بخش مدیریت تصاویر */}
                <div>
                  <Label>تصاویر محصول</Label>
                  
                  {/* ورود URL */}
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="آدرس تصویر را وارد کنید..."
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={addUrl}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* آپلود فایل */}
                  <div className="mt-2">
                    <Label htmlFor="file-upload" className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
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
                    {uploading && <span className="text-xs text-gray-500 mr-2">در حال آپلود...</span>}
                  </div>

                  {/* پیش‌نمایش تصاویر */}
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
                  {imageUrls.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">حداقل یک تصویر اضافه کنید (یا URL یا آپلود). در غیر این صورت تصویر پیش‌فرض استفاده می‌شود.</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-lg bg-yellow-500 hover:bg-yellow-600"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
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