// src/app/dashboard/admin/seller-requests/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSellerRequests } from "@/server/seller-request-actions"
import { formatDate } from "@/lib/utils"
import { ApproveButton } from "@/components/admin/approve-seller-button"
import { RejectButton } from "@/components/admin/reject-seller-button"

export default async function AdminSellerRequestsPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/login")

  const requests = await getSellerRequests()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📋 درخواست‌های فروشندگی</h1>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>لیست درخواست‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">هیچ درخواستی وجود ندارد.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کاربر</TableHead>
                  <TableHead>نام فروشگاه</TableHead>
                  <TableHead>توضیحات</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{req.user.name || "---"}</p>
                        <p className="text-xs text-gray-500">{req.user.phone || req.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{req.storeName || "---"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{req.description || "---"}</TableCell>
                    <TableCell>{formatDate(req.createdAt)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        req.status === "APPROVED" ? "bg-green-100 text-green-700" :
                        req.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {req.status === "PENDING" ? "در انتظار" : req.status === "APPROVED" ? "تأیید شد" : "رد شد"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {req.status === "PENDING" && (
                        <div className="flex gap-2">
                          <ApproveButton requestId={req.id} />
                          <RejectButton requestId={req.id} />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}