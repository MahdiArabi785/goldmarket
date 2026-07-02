"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminUpdateUser } from "@/server/admin-actions"

interface User {
  id: string
  name: string | null
  phone: string | null
  email: string | null
  role: string
}

export function EditUserForm({ user }: { user: User }) {
  const router = useRouter()
  const [name, setName] = useState(user.name || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [email, setEmail] = useState(user.email || "")
  const [role, setRole] = useState(user.role || "BUYER")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await adminUpdateUser(user.id, {
        name,
        phone,
        email,
        role,
        ...(password ? { password } : {}),
      })
      toast.success("تغییرات با موفقیت ذخیره شد")
      router.push("/dashboard/admin/users")
    } catch (error: any) {
      toast.error(error.message || "خطا در ذخیره تغییرات")
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>اطلاعات کاربر</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>نام</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>شماره موبایل</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label>ایمیل</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>نقش</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BUYER">خریدار</SelectItem>
              <SelectItem value="SELLER">فروشنده</SelectItem>
              <SelectItem value="EXPERT">کارشناس</SelectItem>
              <SelectItem value="ADMIN">ادمین</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>رمز عبور جدید (در صورت نیاز به تغییر)</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="حداقل ۶ کاراکتر"
          />
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full bg-red-500 hover:bg-red-600">
          {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </CardContent>
    </Card>
  )
}