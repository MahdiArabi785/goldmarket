import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function proxy(req: NextRequest) {
  const session = await auth()
  const path = req.nextUrl.pathname

  // مسیرهای عمومی (نیاز به احراز هویت ندارند)
  const publicPaths = [
  "/",
  "/market",
  "/login",
  "/register",
  "/analysis",
  "/favorites",
  "/subscription",
  "/become-seller",
  "/api/auth",
  "/api/gold-price",
]

  // بررسی مسیرهای عمومی
  const isPublicPath = publicPaths.some(
    (p) => path === p || path.startsWith(p + "/") || path.startsWith("/api/auth")
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  // اگر کاربر وارد نشده باشد، هدایت به صفحه ورود
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(loginUrl)
  }

  const role = (session.user as any).role

  // محافظت از مسیرهای فروشنده
  if (path.startsWith("/dashboard/seller")) {
    if (role !== "SELLER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/buyer", req.url))
    }
  }

  // محافظت از مسیرهای کارشناس
  if (path.startsWith("/dashboard/expert")) {
    if (role !== "EXPERT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/buyer", req.url))
    }
  }

  // محافظت از مسیرهای ادمین
  if (path.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/buyer", req.url))
    }
  }

  // اگر کاربر وارد شده و به داشبورد خودش می‌رود
  if (path === "/dashboard") {
    switch (role) {
      case "SELLER":
        return NextResponse.redirect(new URL("/dashboard/seller", req.url))
      case "EXPERT":
        return NextResponse.redirect(new URL("/dashboard/expert", req.url))
      default:
        return NextResponse.redirect(new URL("/dashboard/buyer", req.url))
    }
  }

  return NextResponse.next()
}

// مسیرهایی که proxy روی آن‌ها اعمال می‌شود
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/wallet/:path*",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}