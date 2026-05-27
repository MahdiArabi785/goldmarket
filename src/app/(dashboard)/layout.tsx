import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { UserMenu } from "@/components/layout/user-menu"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/auth/login")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* هدر */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <a href="/market" className="text-2xl font-bold text-yellow-600">
                🏪 GoldMarket
              </a>
              <DashboardNav role={(session.user as any).role} />
            </div>
            <UserMenu user={session.user} />
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main>{children}</main>
    </div>
  )
}