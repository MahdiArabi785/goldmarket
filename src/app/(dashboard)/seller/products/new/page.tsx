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
import { Loader2, Save } from "lucide-react"

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
  const [activeTab, setActiveTab] = useState("manual")
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

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value)
      })

      await createProduct(formData)
      toast.success("محصول با موفقیت ثبت شد! 🎉")
      router.push("/dashboard/seller")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "خطا در ثبت محصول")
    }
    setLoading(false)
  }

  const handleBarcodeScan = (barcode: string) => {
    form.setValue("barcode", barcode)
    toast.success(`بارکد ${barcode} شناسایی شد`)
    // در نسخه واقعی، اطلاعات محصول از API بارکد دریافت می‌شود
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">➕ افزودن محصول جدید</h1>
        <p className="text-gray-600 mt-2">محصول جدید را به فروشگاه خود اضافه کنید</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">ثبت دستی</TabsTrigger>
          <TabsTrigger value="barcode">اسکن بارکد</TabsTrigger>
        </TabsList>

        <TabsContent value="barcode">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <BarcodeScanner onScan={handleBarcodeScan} />
              {form.watch("barcode") && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl">
                  <p className="font-medium">بارکد شناسایی شده:</p>
                  <p className="text-green-700 text-lg">{form.watch("barcode")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>اطلاعات محصول</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* نام محصول */}
                <div>
                  <Label>نام محصول *</Label>
                  <Input {...form.register("name")} placeholder="مثال: گردنبند طلا ۱۸ عیار" />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {/* نوع طلا */}
                <div>
                  <Label>نوع طلا *</Label>
                  <Select onValueChange={(v) => form.setValue("type", v as any)} defaultValue="NEW">
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
                    <Input {...form.register("weight")} type="number" step="0.01" placeholder="مثال: ۵.۵" />
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
                    <Input {...form.register("barcode")} placeholder="کد بارکد محصول" />
                  </div>
                </div>

                {/* توضیحات */}
                <div>
                  <Label>توضیحات</Label>
                  <textarea
                    {...form.register("description")}
                    className="w-full min-h-[100px] rounded-xl border border-gray-300 p-3 text-sm"
                    placeholder="توضیحات تکمیلی محصول..."
                  />
                </div>

                {/* دکمه ثبت */}
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