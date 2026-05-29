"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { loginWithPassword, resendOTP } from "@/server/auth-actions"
import Link from "next/link"
import { Loader2, LogIn, KeyRound, Lock, Shield, ArrowLeft, RefreshCw, UserPlus } from "lucide-react"

const loginSchema = z.object({
  username: z.string().min(1, "شماره موبایل یا ایمیل را وارد کنید"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
})

const otpSchema = z.object({
  code: z.string().length(6, "کد تأیید باید ۶ رقم باشد"),
})

export default function LoginPage() {
  const [step, setStep] = useState<"login" | "otp">("login")
  const [identifier, setIdentifier] = useState("")
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  })

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  })

  const handleLogin = async (data: { username: string; password: string }) => {
    setLoading(true)
    try {
      const result = await loginWithPassword(data.username, data.password)
      if (result.success) {
        if (result.isRoot) {
          // ورود مستقیم ادمین
          const res = await signIn("credentials", {
            username: data.username,
            password: data.password,
            redirect: false,
          })
          if (res?.error) {
            toast.error("خطا در ورود مدیر")
          } else {
            toast.success("خوش آمدید مدیر!")
            router.push("/dashboard/admin")
            router.refresh()
          }
        } else {
          toast.success(result.message)
          setIdentifier(result.identifier!)
          setStep("otp")
          setTimer(120)
          loginForm.reset()
        }
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("خطا در برقراری ارتباط")
    }
    setLoading(false)
  }

  const handleOTP = async (data: { code: string }) => {
    setLoading(true)
    try {
      const res = await signIn("credentials", {
        identifier: identifier,
        code: data.code,
        redirect: false,
      })
      if (res?.error) {
        toast.error("کد تأیید اشتباه یا منقضی شده است")
      } else {
        toast.success("خوش آمدید! 🎉")
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      toast.error("خطا در تأیید کد")
    }
    setLoading(false)
  }

  const handleResendOTP = async () => {
    if (timer > 0) return
    setLoading(true)
    try {
      const result = await resendOTP(identifier)
      if (result.success) {
        toast.success(result.message)
        setTimer(120)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("خطا در ارسال مجدد کد")
    }
    setLoading(false)
  }

  const handleBackToLogin = () => {
    setStep("login")
    setIdentifier("")
    otpForm.reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6 text-white text-center">
            {step === "login" ? (
              <LogIn className="w-12 h-12 mx-auto mb-2 opacity-90" />
            ) : (
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-90" />
            )}
            <CardTitle className="text-2xl font-bold">
              {step === "login" ? "ورود به GoldMarket" : "تأیید دو مرحله‌ای"}
            </CardTitle>
            <CardDescription className="text-white/80 mt-1">
              {step === "login"
                ? "نام کاربری و رمز عبور خود را وارد کنید"
                : "کد ۶ رقمی ارسال شده را وارد نمایید"}
            </CardDescription>
          </div>

          <CardContent className="p-6">
            {step === "login" ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div className="relative">
                  <KeyRound className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    {...loginForm.register("username")}
                    placeholder="شماره موبایل یا ایمیل (یا root)"
                    className="pr-10 text-left"
                    autoFocus
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    {...loginForm.register("password")}
                    type="password"
                    placeholder="رمز عبور"
                    className="pr-10 text-left"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-lg bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 ml-2" />
                      ورود به حساب
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={otpForm.handleSubmit(handleOTP)} className="space-y-4">
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                  <p className="text-sm text-gray-700">کد تأیید به</p>
                  <p className="text-lg font-bold text-yellow-600 mt-1 dir-ltr">{identifier}</p>
                  <p className="text-xs text-gray-500 mt-2">کد تا ۵ دقیقه معتبر است</p>
                </div>

                <div>
                  <Input
                    {...otpForm.register("code")}
                    placeholder="• • • • • •"
                    className="text-center text-2xl tracking-[0.5em] py-6 font-bold"
                    maxLength={6}
                    autoFocus
                  />
                  {otpForm.formState.errors.code && (
                    <p className="text-red-500 text-xs mt-1 text-center">{otpForm.formState.errors.code.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <Shield className="h-5 w-5 ml-2" />
                      تأیید و ورود
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={timer > 0 || loading}
                    className={`inline-flex items-center gap-1 text-sm transition-colors ${
                      timer > 0 ? "text-gray-400 cursor-not-allowed" : "text-yellow-600 hover:text-yellow-700"
                    }`}
                  >
                    <RefreshCw className={`h-4 w-4`} />
                    {timer > 0
                      ? `ارسال مجدد (${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")})`
                      : "کد را دریافت نکردید؟ ارسال مجدد"}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">
                    {step === "login" ? "حساب کاربری ندارید؟" : "انصراف"}
                  </span>
                </div>
              </div>

              <div className="text-center">
                {step === "login" ? (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    ایجاد حساب جدید
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 font-medium transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    بازگشت به صفحه ورود
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-4">
          ورود شما به معنای پذیرش قوانین و شرایط GoldMarket است
        </p>
      </div>
    </div>
  )
}