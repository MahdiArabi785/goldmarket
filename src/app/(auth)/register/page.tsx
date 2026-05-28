"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { registerUser } from "@/server/auth-actions"
import Link from "next/link"
import { Loader2, UserPlus, Phone, Mail, User, Lock } from "lucide-react"

// اسکیمای ثبت‌نام با شماره تلفن
const phoneSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"),
  name: z.string().optional(),
  password: z.string().min(6, "رمز عبور حداقل ۶ حرف یا عدد باشد"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "رمز عبور و تکرار آن مطابقت ندارند",
  path: ["confirmPassword"],
})

// اسکیمای ثبت‌نام با ایمیل
const emailSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید (مثال: user@example.com)"),
  name: z.string().optional(),
  password: z.string().min(6, "رمز عبور حداقل ۶ حرف یا عدد باشد"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "رمز عبور و تکرار آن مطابقت ندارند",
  path: ["confirmPassword"],
})

type PhoneFormData = z.infer<typeof phoneSchema>
type EmailFormData = z.infer<typeof emailSchema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone")
  const router = useRouter()

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "", name: "", password: "", confirmPassword: "" },
  })

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", name: "", password: "", confirmPassword: "" },
  })

  // ثبت‌نام با شماره تلفن
  const onSubmitPhone = async (data: PhoneFormData) => {
    setLoading(true)
    try {
      const result = await registerUser({
        type: "phone",
        phone: data.phone,
        name: data.name || undefined,
        password: data.password,
      })
      if (result.success) {
        toast.success(result.message)
        setTimeout(() => router.push("/login"), 1000)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.")
    }
    setLoading(false)
  }

  // ثبت‌نام با ایمیل
  const onSubmitEmail = async (data: EmailFormData) => {
    setLoading(true)
    try {
      const result = await registerUser({
        type: "email",
        email: data.email,
        name: data.name || undefined,
        password: data.password,
      })
      if (result.success) {
        toast.success(result.message)
        setTimeout(() => router.push("/login"), 1000)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
          {/* هدر کارت */}
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6 text-white text-center">
            <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-90" />
            <CardTitle className="text-2xl font-bold">عضویت در GoldMarket</CardTitle>
            <CardDescription className="text-white/80 mt-1">
              یکی از روش‌های زیر را برای ثبت‌نام انتخاب کنید
            </CardDescription>
          </div>

          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "phone" | "email")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="phone" className="gap-2">
                  <Phone className="h-4 w-4" />
                  با شماره تلفن
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="h-4 w-4" />
                  با ایمیل
                </TabsTrigger>
              </TabsList>

              {/* فرم ثبت‌نام با شماره تلفن */}
              <TabsContent value="phone">
                <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} className="space-y-4">
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...phoneForm.register("phone")}
                      placeholder="شماره موبایل * (مثال: ۰۹۱۲۳۴۵۶۷۸۹)"
                      className="pr-10 text-left"
                      maxLength={11}
                    />
                    {phoneForm.formState.errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{phoneForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...phoneForm.register("name")}
                      placeholder="نام شما (اختیاری)"
                      className="pr-10"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...phoneForm.register("password")}
                      type="password"
                      placeholder="رمز عبور * (حداقل ۶ حرف یا عدد)"
                      className="pr-10 text-left"
                    />
                    {phoneForm.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">{phoneForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...phoneForm.register("confirmPassword")}
                      type="password"
                      placeholder="تکرار رمز عبور *"
                      className="pr-10 text-left"
                    />
                    {phoneForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{phoneForm.formState.errors.confirmPassword.message}</p>
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
                        <UserPlus className="h-5 w-5 ml-2" />
                        ثبت‌نام با شماره تلفن
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* فرم ثبت‌نام با ایمیل */}
              <TabsContent value="email">
                <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...emailForm.register("email")}
                      type="email"
                      placeholder="ایمیل * (مثال: user@example.com)"
                      className="pr-10 text-left"
                    />
                    {emailForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1">{emailForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...emailForm.register("name")}
                      placeholder="نام شما (اختیاری)"
                      className="pr-10"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...emailForm.register("password")}
                      type="password"
                      placeholder="رمز عبور * (حداقل ۶ حرف یا عدد)"
                      className="pr-10 text-left"
                    />
                    {emailForm.formState.errors.password && (
                      <p className="text-red-500 text-xs mt-1">{emailForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      {...emailForm.register("confirmPassword")}
                      type="password"
                      placeholder="تکرار رمز عبور *"
                      className="pr-10 text-left"
                    />
                    {emailForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{emailForm.formState.errors.confirmPassword.message}</p>
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
                        <UserPlus className="h-5 w-5 ml-2" />
                        ثبت‌نام با ایمیل
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* لینک ورود */}
            <div className="mt-6 text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">قبلاً عضو شده‌اید؟</span>
                </div>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
              >
                رفتن به صفحه ورود
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-4">
          با عضویت در GoldMarket، قوانین و شرایط استفاده را می‌پذیرید
        </p>
      </div>
    </div>
  )
}