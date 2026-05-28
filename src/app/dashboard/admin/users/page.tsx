import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getAllUsers, adminDeleteUser } from "@/server/admin-actions"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Trash2, Edit, UserPlus } from "lucide-react"
import { DeleteUserButton } from "@/components/admin/delete-user-button"

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/login")

  const users = await getAllUsers()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">👥 مدیریت کاربران</h1>
        <Link href="/dashboard/admin/users/new">
          <Button className="gap-2 bg-red-500 hover:bg-red-600">
            <UserPlus className="h-4 w-4" />
            کاربر جدید
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>شماره / ایمیل</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>موجودی</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name || "---"}</TableCell>
                <TableCell>
                  {user.phone || user.email || "---"}
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.walletBalance.toLocaleString("fa-IR")} تومان</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/dashboard/admin/users/${user.id}`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <DeleteUserButton userId={user.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}