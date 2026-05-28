"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminCreateUser } from "@/server/admin-actions"

export default function NewUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      phone: "",
      email: "",
      name: "",
      password: "",
      role: "BUYER",
    },
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      await adminCreateUser(data)
      toast.success("کاربر با موفقیت ایجاد شد")
      router.push("/dashboard/admin/users")
    } catch (error: any) {
      toast.error(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-6">➕ افزودن کاربر جدید</h1>
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات کاربر</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>نام</Label>
              <Input {...register("name")} placeholder="نام کاربر" />
            </div>
            <div>
              <Label>شماره موبایل</Label>
              <Input {...register("phone")} placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
            </div>
            <div>
              <Label>ایمیل</Label>
              <Input {...register("email")} placeholder="user@example.com" />
            </div>
            <div>
              <Label>رمز عبور</Label>
              <Input type="password" {...register("password")} placeholder="حداقل ۶ کاراکتر" />
            </div>
            <div>
              <Label>نقش</Label>
              <Select onValueChange={(v) => setValue("role", v)} defaultValue="BUYER">
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نقش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUYER">خریدار</SelectItem>
                  <SelectItem value="SELLER">فروشنده</SelectItem>
                  <SelectItem value="EXPERT">کارشناس</SelectItem>
                  <SelectItem value="ADMIN">ادمین</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-red-500 hover:bg-red-600">
              {loading ? "در حال ایجاد..." : "ایجاد کاربر"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}