"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { withdrawFromWallet } from "@/server/wallet-actions"
import { Loader2 } from "lucide-react"

export function WalletWithdrawForm() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) < 100000) {
      toast.error("حداقل مبلغ برداشت ۱۰۰,۰۰۰ تومان است")
      return
    }

    setLoading(true)
    try {
      await withdrawFromWallet(parseFloat(amount))
      toast.success("برداشت با موفقیت انجام شد")
      router.refresh()
      setAmount("")
    } catch (error: any) {
      toast.error(error.message || "خطا در برداشت")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>مبلغ برداشت (تومان)</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="مبلغ مورد نظر"
          className="text-lg mt-2"
          min={100000}
        />
      </div>
      <Button
        onClick={handleWithdraw}
        disabled={loading || !amount}
        className="w-full bg-red-500 hover:bg-red-600"
      >
        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "برداشت وجه"}
      </Button>
    </div>
  )
}