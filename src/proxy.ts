import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default async function proxy(req: any) {
  const session = await auth()
  const path = req.nextUrl.pathname

  // مسیرهای عمومی
  const publicPaths = ["/", "/market", "/login", "/analysis"]
  if (publicPaths.some((p) => path === p)) {
    return NextResponse.next()
  }

  // اگر کاربر وارد نشده باشد
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  const role = (session.user as any).role

  // محافظت از مسیرهای فروشنده
  if (path.startsWith("/dashboard/seller") && role !== "SELLER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/buyer", req.url))
  }

  // محافظت از مسیرهای کارشناس
  if (path.startsWith("/dashboard/expert") && role !== "EXPERT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/buyer", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/wallet/:path*",
  ],
}