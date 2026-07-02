// src/components/admin/approve-seller-button.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { approveSellerRequest } from "@/server/seller-request-actions"
import { Check, Loader2 } from "lucide-react"

export function ApproveButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    setLoading(true)
    try {
      const result = await approveSellerRequest(requestId)
      toast.success(result.message)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleApprove} disabled={loading}
      className="text-green-600 hover:bg-green-50">
      {loading ? <Loader2 className="h-4 w-4 ml-1 animate-spin" /> : <Check className="h-4 w-4 ml-1" />}
      تأیید
    </Button>
  )
}