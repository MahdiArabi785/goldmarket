"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { toast } from "sonner"
import { Search } from "lucide-react"

export default function BarcodePage() {
  const [manualBarcode, setManualBarcode] = useState("")
  const router = useRouter()

  const handleBarcodeFound = (barcode: string) => {
    // هدایت به صفحه نتیجه با پارامتر barcode
    router.push(`/dashboard/seller/barcode/result?code=${encodeURIComponent(barcode)}`)
  }

  const handleManualSearch = () => {
    if (manualBarcode.trim()) {
      router.push(`/dashboard/seller/barcode/result?code=${encodeURIComponent(manualBarcode.trim())}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">📷 سیستم بارکد</h1>
        <p className="text-gray-600 mt-2">بارکد محصول را اسکن کنید یا دستی وارد کنید تا اطلاعات کامل آن نمایش داده شود</p>
      </div>

      <Tabs defaultValue="scanner">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">اسکن با دوربین</TabsTrigger>
          <TabsTrigger value="manual">ورود دستی</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>اسکن بارکد</CardTitle>
            </CardHeader>
            <CardContent>
              <BarcodeScanner onScan={handleBarcodeFound} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>ورود دستی بارکد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>کد بارکد</Label>
                <Input
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="کد بارکد را وارد کنید..."
                  className="text-lg"
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                />
              </div>
              <Button
                onClick={handleManualSearch}
                className="w-full gap-2 bg-yellow-500 hover:bg-yellow-600"
                disabled={!manualBarcode.trim()}
              >
                <Search className="h-4 w-4" />
                جستجوی بارکد
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}