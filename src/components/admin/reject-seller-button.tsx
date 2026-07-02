// src/components/admin/reject-seller-button.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { rejectSellerRequest } from "@/server/seller-request-actions"
import { X, Loader2 } from "lucide-react"

export function RejectButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReject = async () => {
    setLoading(true)
    try {
      const result = await rejectSellerRequest(requestId)
      toast.success(result.message)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleReject} disabled={loading}
      className="text-red-600 hover:bg-red-50">
      {loading ? <Loader2 className="h-4 w-4 ml-1 animate-spin" /> : <X className="h-4 w-4 ml-1" />}
      رد
    </Button>
  )
}