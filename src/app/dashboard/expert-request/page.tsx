"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function ExpertRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const res = await fetch("/api/expert-requests", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("خطا در ثبت درخواست")
      toast.success("درخواست کارشناسی با موفقیت ثبت شد")
      router.push("/dashboard/buyer")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader><CardTitle>📋 درخواست کارشناسی طلا</CardTitle></CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div>
              <Label>وزن تقریبی (گرم)</Label>
              <Input name="weight" type="number" step="0.01" />
            </div>
            <div>
              <Label>عیار</Label>
              <Input name="karat" type="number" defaultValue={18} />
            </div>
            <div>
              <Label>تصاویر (اختیاری - آپلود جداگانه)</Label>
              <Input name="images" type="file" multiple accept="image/*" />
            </div>
            <div>
              <Label>توضیحات</Label>
              <Textarea name="notes" placeholder="توضیحات خود را بنویسید..." />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "در حال ثبت..." : "ثبت درخواست"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}