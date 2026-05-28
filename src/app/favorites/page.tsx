import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Link from "next/link"

export default async function FavoritesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500" />
          علاقه‌مندی‌ها
        </h1>
        <p className="text-gray-600 mt-2">محصولاتی که پسندیده‌اید</p>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-12 text-center">
          <Heart className="h-20 w-20 mx-auto text-gray-200 mb-4" />
          <p className="text-xl text-gray-500 mb-2">هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید</p>
          <p className="text-gray-400 mb-6">محصولات مورد علاقه خود را با کلیک روی قلب ذخیره کنید</p>
          <Link href="/market">
            <Button className="bg-yellow-500 hover:bg-yellow-600">مشاهده بازار</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}