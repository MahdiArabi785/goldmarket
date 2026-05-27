"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const buyerLinks = [
  { href: "/dashboard/buyer", label: "داشبورد", icon: "🏠" },
  { href: "/market", label: "بازار", icon: "🛒" },
  { href: "/dashboard/buyer/orders", label: "سفارشات", icon: "📦" },
  { href: "/wallet", label: "کیف پول", icon: "💰" },
  { href: "/analysis", label: "تحلیل", icon: "📈" },
]

const sellerLinks = [
  { href: "/dashboard/seller", label: "داشبورد", icon: "🏠" },
  { href: "/market", label: "بازار", icon: "🛒" },
  { href: "/dashboard/seller/products/new", label: "محصول جدید", icon: "➕" },
  { href: "/dashboard/seller/barcode", label: "بارکدخوان", icon: "📷" },
  { href: "/wallet", label: "کیف پول", icon: "💰" },
]

const expertLinks = [
  { href: "/dashboard/expert", label: "داشبورد", icon: "🏠" },
  { href: "/market", label: "بازار", icon: "🛒" },
]

export function DashboardNav({ role }: { role?: string }) {
  const pathname = usePathname()

  const links =
    role === "SELLER"
      ? sellerLinks
      : role === "EXPERT"
      ? expertLinks
      : buyerLinks

  return (
    <nav className="hidden md:flex items-center gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              isActive
                ? "bg-yellow-100 text-yellow-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <span className="ml-1">{link.icon}</span>
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
