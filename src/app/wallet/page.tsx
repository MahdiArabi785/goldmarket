import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { WalletDepositForm } from "@/components/wallet-deposit-form"
import { WalletWithdrawForm } from "@/components/wallet-withdraw-form"
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default async function WalletPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const userId = (session.user as any).id

  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  const totalDeposits = transactions
    .filter((t) => t.type === "DEPOSIT" || t.type === "REFUND")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const totalWithdrawals = transactions
    .filter((t) => t.type === "WITHDRAW" || t.type === "PURCHASE")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">💰 کیف پول</h1>
        <p className="text-gray-600 mt-2">مدیریت موجودی و تراکنش‌ها</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-400 to-amber-500 text-white col-span-1 md:col-span-3">
          <CardContent className="p-8 text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <p className="text-lg opacity-90 mb-2">موجودی کیف پول</p>
            <p className="text-4xl font-extrabold">{formatCurrency(user?.walletBalance || 0)}</p>
            <p className="text-lg opacity-90 mt-1">تومان</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-xl">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-gray-600">کل واریزی‌ها</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDeposits)}</p>
            <p className="text-sm text-gray-500">تومان</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-xl">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-gray-600">کل برداشت‌ها</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalWithdrawals)}</p>
            <p className="text-sm text-gray-500">تومان</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-gray-600">تعداد تراکنش‌ها</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
            <p className="text-sm text-gray-500">تراکنش</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-green-600">➕ شارژ کیف پول</CardTitle>
          </CardHeader>
          <CardContent>
            <WalletDepositForm />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-red-600">➖ برداشت از کیف پول</CardTitle>
          </CardHeader>
          <CardContent>
            <WalletWithdrawForm />
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>تاریخچه تراکنش‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">هنوز تراکنشی انجام نشده است</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${tx.amount > 0 ? "bg-green-100" : "bg-red-100"}`}>
                      {tx.amount > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {tx.type === "DEPOSIT" && "شارژ کیف پول"}
                        {tx.type === "WITHDRAW" && "برداشت از کیف پول"}
                        {tx.type === "PURCHASE" && "خرید طلا"}
                        {tx.type === "SALE" && "فروش طلا"}
                        {tx.type === "REFUND" && "بازگشت وجه"}
                      </p>
                      {tx.description && (
                        <p className="text-sm text-gray-500">{tx.description}</p>
                      )}
                      <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-lg ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {tx.amount > 0 ? "+" : ""}
                    {formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}