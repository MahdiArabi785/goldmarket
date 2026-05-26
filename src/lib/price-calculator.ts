export interface PriceBreakdown {
  rawPrice: number       // قیمت خام طلا
  wage: number           // اجرت
  profit: number         // سود فروشنده
  tax: number            // مالیات ۹٪
  finalPrice: number     // قیمت نهایی
}

export function calculateGoldPrice(
  weight: number,        // گرم
  liveGoldPrice: number, // قیمت هر گرم طلای ۱۸ عیار
  wage: number,          // اجرت ساخت
  profitPercent: number, // درصد سود فروشنده (مثلاً ۷)
  taxPercent: number = 9 // مالیات
): PriceBreakdown {
  const rawPrice = weight * liveGoldPrice
  const profit = (rawPrice + wage) * (profitPercent / 100)
  const tax = (rawPrice + wage + profit) * (taxPercent / 100)
  const finalPrice = rawPrice + wage + profit + tax

  return {
    rawPrice: Math.round(rawPrice),
    wage,
    profit: Math.round(profit),
    tax: Math.round(tax),
    finalPrice: Math.round(finalPrice)
  }
}