"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { submitStolenGoldReport } from "@/server/report-actions"
import { Loader2, Upload, X, Plus } from "lucide-react"

export default function ReportStolenPage() {
  const router = useRouter()
  const [description, setDescription] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
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
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      if (!res.ok) throw new Error("خطا در آپلود")
      const data = await res.json()
      setImageUrls([...imageUrls, data.url])
      toast.success("تصویر آپلود شد")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      toast.error("لطفاً توضیحات را وارد کنید")
      return
    }
    setLoading(true)
    try {
      await submitStolenGoldReport(description, imageUrls)
      toast.success("گزارش شما با موفقیت ثبت شد. ممنون از همکاری شما.")
      router.push("/dashboard/buyer")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">🚨 گزارش طلای سرقتی</h1>
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات طلای سرقتی</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>توضیحات *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مشخصات طلا، زمان و مکان سرقت، شماره تماس و..."
                rows={5}
              />
            </div>

            <div>
              <Label>تصاویر (اختیاری)</Label>
              <div className="flex gap-2 mt-2">
                <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="آدرس تصویر..." />
                <Button type="button" variant="outline" onClick={addUrl}><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="mt-2">
                <Label htmlFor="stolen-file-upload" className="cursor-pointer inline-flex items-center gap-2 text-sm text-blue-600">
                  <Upload className="h-4 w-4" /> آپلود تصویر
                </Label>
                <input id="stolen-file-upload" type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
              </div>
              {imageUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeUrl(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-red-500 hover:bg-red-600">
              {loading ? <Loader2 className="animate-spin h-4 w-4 ml-2" /> : "ثبت گزارش"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}