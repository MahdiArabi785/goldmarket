'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sendOTP, verifyOTP } from '@/server/auth-actions'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

const phoneSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید')
})

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const phoneForm = useForm({ resolver: zodResolver(phoneSchema) })
  const otpForm = useForm()

  const handleSendOTP = async (data: { phone: string }) => {
    setLoading(true)
    try {
      await sendOTP(data.phone)
      setPhone(data.phone)
      setStep('otp')
      toast.success('کد تأیید ارسال شد')
    } catch {
      toast.error('خطا در ارسال کد')
    }
    setLoading(false)
  }

  const handleVerifyOTP = async (data: { code: string }) => {
    setLoading(true)
    try {
      const user = await verifyOTP(phone, data.code)
      await signIn('credentials', { phone, redirect: false })
      toast.success('خوش آمدید!')
      // ریدایرکت به داشبورد
    } catch {
      toast.error('کد اشتباه است')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-yellow-600">
            🏪 GoldMarket
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={phoneForm.handleSubmit(handleSendOTP)}>
              <Input {...phoneForm.register('phone')} placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                ارسال کد تأیید
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)}>
              <Input {...otpForm.register('code')} placeholder="کد ۶ رقمی" maxLength={6} />
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                ورود
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}