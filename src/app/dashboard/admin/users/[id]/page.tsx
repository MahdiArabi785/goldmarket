// src/app/dashboard/admin/users/[id]/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserById } from "@/server/admin-actions"
import { EditUserForm } from "@/components/admin/edit-user-form"

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/login")

  // در Next.js 16، params باید await شود
  const { id } = await params
  const user = await getUserById(id)

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500">کاربر مورد نظر یافت نشد</div>
    )
  }

  // تبدیل Object به plain object برای ارسال به Client Component
  const plainUser = JSON.parse(JSON.stringify(user))

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-6">✏️ ویرایش کاربر</h1>
      <EditUserForm user={plainUser} />
    </div>
  )
}