"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import { Check, X, Loader2, User } from "lucide-react"

interface ExpertRequestCardProps {
  request: {
    id: string
    user: { name: string | null; phone: string | null }
    weight: number | null
    karat: number | null
    notes: string | null
    images: string[]
    createdAt: Date
  }
}

export function ExpertRequestCard({ request }: ExpertRequestCardProps) {
  const [loading, setLoading] = useState(false)
  const [expertNotes, setExpertNotes] = useState("")
  const router = useRouter()

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setLoading(true)
    try {
      const res = await fetch("/api/expert-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          status,
          expertNotes,
        }),
      })

      if (res.ok) {
        toast.success(status === "APPROVED" ? "درخواست تأیید شد ✓" : "درخواست رد شد ✗")
        router.refresh()
      } else {
        toast.error("خطا در ثبت نظر")
      }
    } catch {
      toast.error("خطا در ارتباط با سرور")
    }
    setLoading(false)
  }

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* اطلاعات کاربر */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">{request.user.name || "کاربر"}</p>
                <p className="text-sm text-gray-500">{request.user.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              {request.weight && (
                <div>
                  <span className="text-gray-500">وزن:</span>
                  <span className="font-bold mr-1">{request.weight} گرم</span>
                </div>
              )}
              {request.karat && (
                <div>
                  <span className="text-gray-500">عیار:</span>
                  <span className="font-bold mr-1">{request.karat}</span>
                </div>
              )}
            </div>

            {request.notes && (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                {request.notes}
              </p>
            )}

            <p className="text-xs text-gray-400">{formatDate(request.createdAt)}</p>
          </div>

          {/* تصاویر */}
          {request.images.length > 0 && (
            <div className="flex gap-2">
              {request.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`تصویر ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-xl"
                />
              ))}
            </div>
          )}

          {/* نظر کارشناس و دکمه‌ها */}
          <div className="md:w-64 space-y-3">
            <Textarea
              placeholder="نظر کارشناسی..."
              value={expertNotes}
              onChange={(e) => setExpertNotes(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleAction("APPROVED")}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
                تأیید
              </Button>
              <Button
                onClick={() => handleAction("REJECTED")}
                disabled={loading}
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <X className="h-4 w-4" />}
                رد
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

