// src/components/admin/admin-sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Package,
  UserPlus,
  Shield,
  Store,
} from "lucide-react"

const adminLinks = [
  { href: "/dashboard/admin", label: "داشبورد مدیریت", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "مدیریت کاربران", icon: Users },
  { href: "/dashboard/admin/users/new", label: "افزودن کاربر جدید", icon: UserPlus },
  { href: "/dashboard/admin/products", label: "مدیریت محصولات", icon: Package },
  { href: "/dashboard/admin/seller-requests", label: "درخواست‌های فروشندگی", icon: Store },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-l border-gray-200 min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8 px-3">
        <Shield className="h-6 w-6 text-red-500" />
        <h2 className="text-lg font-bold text-gray-800">پنل مدیریت</h2>
      </div>
      <nav className="space-y-1">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-red-50 text-red-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}