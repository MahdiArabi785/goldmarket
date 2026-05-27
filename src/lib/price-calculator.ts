export interface PriceBreakdown {
  rawPrice: number
  wage: number
  profit: number
  tax: number
  finalPrice: number
}

export function calculateGoldPrice(
  weight: number,
  liveGoldPrice: number,
  wage: number,
  profitPercent: number,
  taxPercent: number = 9
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
    finalPrice: Math.round(finalPrice),
  }
}

export function calculateSecondHandPrice(
  weight: number,
  liveGoldPrice: number,
  originalWage: number,
  usagePercent: number = 20
): PriceBreakdown {
  const deductedWage = originalWage * (1 - usagePercent / 100)
  return calculateGoldPrice(weight, liveGoldPrice, deductedWage, 3)
}

export function calculateMeltedGoldPrice(
  weight: number,
  karat: number,
  liveGoldPrice: number,
  profitPercent: number = 1
): number {
  const purityFactor = karat / 24
  const rawPrice = weight * liveGoldPrice * purityFactor
  const finalPrice = rawPrice * (1 + profitPercent / 100)
  return Math.round(finalPrice)
}