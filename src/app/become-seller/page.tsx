// src/app/become-seller/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { submitSellerRequest } from "@/server/seller-request-actions"
import { Store, Loader2, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"

export default function BecomeSellerPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Store className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-500">برای ثبت درخواست فروشندگی باید وارد شوید</h1>
        <a href="/login" className="mt-4 inline-block">
          <Button className="bg-yellow-500 hover:bg-yellow-600">ورود به حساب</Button>
        </a>
      </div>
    )
  }

  const user = session.user as any
  if (user.role === "SELLER" || user.role === "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl font-bold">شما قبلاً یک فروشنده هستید!</h1>
        <p className="text-gray-600 mt-2">به داشبورد فروشنده خود بروید.</p>
        <a href="/dashboard/seller" className="mt-4 inline-block">
          <Button className="bg-yellow-500 hover:bg-yellow-600">داشبورد فروشنده</Button>
        </a>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const result = await submitSellerRequest(formData)
      if (result.success) {
        toast.success(result.message)
        router.push("/dashboard/buyer")
      } else {
        toast.error(result.message)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="text-center mb-8">
        <Store className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold">ثبت فروشگاه جدید</h1>
        <p className="text-gray-600 mt-2">
          لطفاً اطلاعات فروشگاه خود را وارد کنید. پس از تأیید ادمین، حساب شما به فروشنده ارتقا می‌یابد.
        </p>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>اطلاعات فروشگاه</CardTitle>
          <CardDescription>نام فروشگاه و توضیحات (اختیاری) را وارد کنید.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label>نام فروشگاه *</Label>
              <Input name="storeName" placeholder="مثال: طلافروشی البرز" required />
            </div>
            <div>
              <Label>توضیحات</Label>
              <Textarea name="description" placeholder="توضیح کوتاه درباره فروشگاه شما..." rows={3} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-yellow-500 hover:bg-yellow-600">
              {loading ? <Loader2 className="animate-spin h-4 w-4 ml-2" /> : "ارسال درخواست"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}