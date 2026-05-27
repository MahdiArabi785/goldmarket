"use client"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, Wallet } from "lucide-react"

const ROLE_LABEL: Record<string, string> = {
  BUYER: "خریدار",
  SELLER: "فروشنده",
  EXPERT: "کارشناس",
  ADMIN: "ادمین",
}

export function UserMenu({ user }: { user: any }) {
  const router = useRouter()

  const initials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.phone?.slice(-4) || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            <AvatarFallback className="bg-yellow-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user?.name || "کاربر"}</span>
            <span className="text-xs text-gray-500">{user?.phone}</span>
            <span className="text-xs text-yellow-600 mt-1">
              {ROLE_LABEL[user?.role] || user?.role}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/wallet")}>
          <Wallet className="ml-2 h-4 w-4" />
          کیف پول
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/buyer")}>
          <User className="ml-2 h-4 w-4" />
          پروفایل
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="ml-2 h-4 w-4" />
          خروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}