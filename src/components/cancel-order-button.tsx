"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cancelOrder } from "@/server/order-actions"
import { Loader2, X } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setLoading(true)
    try {
      await cancelOrder(orderId)
      toast.success("سفارش با موفقیت لغو شد")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "خطا در لغو سفارش")
    }
    setLoading(false)
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50">
          <X className="h-4 w-4" />
          لغو سفارش
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>آیا از لغو سفارش مطمئن هستید؟</AlertDialogTitle>
          <AlertDialogDescription>
            با لغو سفارش، مبلغ پرداختی به کیف پول شما بازگردانده می‌شود.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} disabled={loading} className="bg-red-500 hover:bg-red-600">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "بله، لغو کن"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}