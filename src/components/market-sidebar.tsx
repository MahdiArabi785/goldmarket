import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  LogIn,
  UserPlus,
  Settings,
  Heart,
  Crown,
  Store,
  User,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"

interface MarketSidebarProps {
  user: any | null
}

export function MarketSidebar({ user }: MarketSidebarProps) {
  // اگر کاربر مهمان است
  if (!user) {
    return (
      <Card className="border-0 shadow-md rounded-2xl overflow-hidden sticky top-24">
        <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-6 text-white text-center">
          <User className="w-12 h-12 mx-auto mb-2 opacity-90" />
          <h3 className="text-xl font-bold">خوش آمدید!</h3>
          <p className="text-sm opacity-90 mt-1">
            برای خرید و فروش امن طلا وارد حساب خود شوید
          </p>
        </div>
        <CardContent className="p-4 space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full gap-2 bg-yellow-500 hover:bg-yellow-600">
              <LogIn className="h-4 w-4" />
              ورود به حساب
            </Button>
          </Link>
          <Link href="/register" className="block">
            <Button variant="outline" className="w-full gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50">
              <UserPlus className="h-4 w-4" />
              ثبت‌نام کنید
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  // اگر کاربر وارد شده است
  const initials = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.phone?.slice(-4) || "U"

  const roleLabels: Record<string, string> = {
    BUYER: "خریدار",
    SELLER: "فروشنده",
    EXPERT: "کارشناس",
    ADMIN: "مدیر",
  }

  const menuItems = [
    {
      href: "/dashboard/buyer",
      icon: Settings,
      label: "تنظیمات پروفایل",
      visible: true,
    },
    {
      href: "/favorites",
      icon: Heart,
      label: "علاقه‌مندی‌ها",
      visible: true,
    },
    {
      href: "/subscription",
      icon: Crown,
      label: "خرید اشتراک ویژه",
      visible: true,
    },
    {
      href: "/become-seller",
      icon: Store,
      label: "ثبت طلافروشی",
      visible: user.role === "BUYER",
    },
    {
      href: "/dashboard/buyer/report-stolen",
      icon: AlertTriangle,
      label: "گزارش طلای سرقتی",
      visible: user.role === "BUYER",
    },
  ]

  return (
    <Card className="border-0 shadow-md rounded-2xl overflow-hidden sticky top-24">
      {/* پروفایل کاربر */}
      <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-6 text-white">
        <div className="flex flex-col items-center">
          <Avatar className="w-20 h-20 border-4 border-white/30 shadow-lg">
            <AvatarImage src={user.image || ""} alt={user.name || "کاربر"} />
            <AvatarFallback className="bg-white text-yellow-600 text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-3 text-lg font-bold">{user.name || "کاربر"}</h3>
          <p className="text-sm opacity-80 mt-1">{user.phone || user.email}</p>
          <Badge className="mt-2 bg-white/20 text-white border-0">
            {roleLabels[user.role] || user.role}
          </Badge>
        </div>
      </div>

      <CardContent className="p-3">
        <nav className="space-y-1">
          {menuItems
            .filter((item) => item.visible)
            .map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-all group"
              >
                <item.icon className="h-5 w-5 text-gray-400 group-hover:text-yellow-500" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
        </nav>

        <Separator className="my-3" />

        <Link
          href="/dashboard/buyer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition-all text-sm"
        >
          <ShieldCheck className="h-5 w-5" />
          مشاهده داشبورد
        </Link>
      </CardContent>
    </Card>
  )
}