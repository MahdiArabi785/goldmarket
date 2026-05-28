import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { UserMenu } from "@/components/layout/user-menu"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = (session.user as any).role
  if (role !== "ADMIN") redirect("/dashboard/buyer")

  return (

      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
  )
}