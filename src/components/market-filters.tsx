"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export function MarketFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/market?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/market")
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">نوع طلا</label>
          <Select onValueChange={(v) => updateFilter("type", v)}>
            <SelectTrigger>
              <SelectValue placeholder="همه" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="NEW">طلا نو</SelectItem>
              <SelectItem value="SECOND_HAND">دست دوم</SelectItem>
              <SelectItem value="MELTED">آب شده</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">حداقل وزن (گرم)</label>
          <Input
            type="number"
            placeholder="مثال: ۱"
            onChange={(e) => updateFilter("minWeight", e.target.value)}
            defaultValue={searchParams.get("minWeight") || ""}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">حداکثر وزن (گرم)</label>
          <Input
            type="number"
            placeholder="مثال: ۱۰۰"
            onChange={(e) => updateFilter("maxWeight", e.target.value)}
            defaultValue={searchParams.get("maxWeight") || ""}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">مرتب‌سازی</label>
          <Select onValueChange={(v) => updateFilter("sort", v)}>
            <SelectTrigger>
              <SelectValue placeholder="جدیدترین" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">جدیدترین</SelectItem>
              <SelectItem value="price_asc">ارزان‌ترین</SelectItem>
              <SelectItem value="price_desc">گران‌ترین</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Button
            variant="outline"
            className="w-full"
            onClick={clearFilters}
          >
            حذف فیلترها
          </Button>
        </div>
      </div>
    </div>
  )
}