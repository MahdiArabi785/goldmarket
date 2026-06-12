import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function proxy(req: NextRequest) {
  const session = await auth()
  const path = req.nextUrl.pathname

  // مسیرهای عمومی (بدون نیاز به ورود)
  const publicPaths = ["/", "/market", "/login", "/register", "/analysis"]
  if (publicPaths.some((p) => path === p) || path.startsWith("/api/auth") || path.startsWith("/api/gold-price")) {
    return NextResponse.next()
  }

  // اگر کاربر وارد نشده باشد
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const role = (session.user as any).role

  // صفحه میانی داشبورد – همیشه مجاز است
  if (path === "/dashboard") {
    return NextResponse.next()
  }

  // نقشه دسترسی مسیرها بر اساس نقش
  const roleRoutes: Record<string, string[]> = {
    BUYER: ["/dashboard/buyer", "/wallet", "/favorites", "/subscription", "/become-seller"],
    SELLER: ["/dashboard/seller"],
    EXPERT: ["/dashboard/expert"],
    ADMIN: ["/dashboard/admin"],
  }

  const allowedPaths = roleRoutes[role] || []
  const isAllowed = allowedPaths.some((route) => path.startsWith(route))

  if (!isAllowed) {
    // کاربر را به /dashboard هدایت کن تا صفحه میانی مسیر درست را تشخیص دهد
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|uploads|api/upload).*)",
  ],
}