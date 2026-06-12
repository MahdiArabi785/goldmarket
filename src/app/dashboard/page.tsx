import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = (session.user as any).role

  switch (role) {
    case "SELLER":
      redirect("/dashboard/seller")
    case "ADMIN":
      redirect("/dashboard/admin")
    case "EXPERT":
      redirect("/dashboard/expert")
    default:
      redirect("/dashboard/buyer")
  }
}