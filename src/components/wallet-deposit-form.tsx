"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { depositToWallet } from "@/server/wallet-actions"
import { Loader2 } from "lucide-react"

const PRESET_AMOUNTS = [500000, 1000000, 5000000, 10000000]

export function WalletDepositForm() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDeposit = async (value?: string) => {
    const depositAmount = value || amount
    if (!depositAmount || parseFloat(depositAmount) < 100000) {
      toast.error("حداقل مبلغ شارژ ۱۰۰,۰۰۰ تومان است")
      return
    }

    setLoading(true)
    try {
      await depositToWallet(parseFloat(depositAmount))
      toast.success("کیف پول با موفقیت شارژ شد! 💰")
      router.refresh()
      setAmount("")
    } catch (error: any) {
      toast.error(error.message || "خطا در شارژ کیف پول")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* مبالغ پیشنهادی */}
      <div className="grid grid-cols-2 gap-2">
        {PRESET_AMOUNTS.map((preset) => (
          <Button
            key={preset}
            variant="outline"
            className="h-14 text-base"
            onClick={() => handleDeposit(preset.toString())}
            disabled={loading}
          >
            {(preset / 1000000).toFixed(1)} میلیون تومان
          </Button>
        ))}
      </div>

      {/* ورود دستی مبلغ */}
      <div>
        <Label>مبلغ دلخواه (تومان)</Label>
        <div className="flex gap-2 mt-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="مثال: ۲,۰۰۰,۰۰۰"
            className="text-lg"
            min={100000}
          />
          <Button
            onClick={() => handleDeposit()}
            disabled={loading || !amount}
            className="bg-green-500 hover:bg-green-600"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "شارژ"}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">حداقل 100,000 تومان</p>
      </div>
    </div>
  )
}