"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sendOTP } from "@/server/auth-actions"
import { Loader2, ArrowRight, Phone } from "lucide-react"

const phoneSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر وارد کنید"),
})

const otpSchema = z.object({
  code: z.string().length(6, "کد تأیید باید ۶ رقم باشد"),
})

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  })

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  })

  const handleSendOTP = async (data: { phone: string }) => {
    setLoading(true)
    try {
      const result = await sendOTP(data.phone)
      if (result.success) {
        setPhoneNumber(data.phone)
        setStep("otp")
        toast.success("کد تأیید ارسال شد (کنسول سرور را بررسی کنید)")
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("خطا در ارسال کد تأیید")
    }
    setLoading(false)
  }

  const handleVerifyOTP = async (data: { code: string }) => {
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        phone: phoneNumber,
        code: data.code,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("خوش آمدید! 🎉")
        router.push("/market")
        router.refresh()
      }
    } catch {
      toast.error("خطا در ورود")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="w-full max-w-md animate-slide-up">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-yellow-600">
              🏪 GoldMarket
            </CardTitle>
            <CardDescription className="text-gray-600 text-base mt-2">
              {step === "phone"
                ? "برای ورود شماره موبایل خود را وارد کنید"
                : "کد تأیید ۶ رقمی ارسال شده را وارد کنید"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {step === "phone" ? (
              <form onSubmit={phoneForm.handleSubmit(handleSendOTP)} className="space-y-4">
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    {...phoneForm.register("phone")}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="pr-10 text-left text-lg py-6"
                    maxLength={11}
                    autoFocus
                  />
                </div>
                {phoneForm.formState.errors.phone && (
                  <p className="text-red-500 text-sm">{phoneForm.formState.errors.phone.message}</p>
                )}
                <Button
                  type="submit"
                  className="w-full py-6 text-lg bg-yellow-500 hover:bg-yellow-600"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      ارسال کد تأیید
                      <ArrowRight className="mr-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
                <p className="text-center text-sm text-gray-500 mb-4">
                  کد به شماره {phoneNumber} ارسال شد
                  <button
                    type="button"
                    className="text-yellow-600 mr-2 hover:underline"
                    onClick={() => setStep("phone")}
                  >
                    ویرایش
                  </button>
                </p>
                <Input
                  {...otpForm.register("code")}
                  placeholder="• • • • • •"
                  className="text-center text-2xl tracking-[1em] py-6"
                  maxLength={6}
                  autoFocus
                />
                {otpForm.formState.errors.code && (
                  <p className="text-red-500 text-sm">{otpForm.formState.errors.code.message}</p>
                )}
                <Button
                  type="submit"
                  className="w-full py-6 text-lg bg-yellow-500 hover:bg-yellow-600"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    "ورود به حساب"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}