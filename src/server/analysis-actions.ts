"use server"

import { prisma } from "@/lib/prisma"
import { AnalysisSignal } from "@/types"

// محاسبه میانگین متحرک ساده
function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = []
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }
  return sma
}

// محاسبه شاخص قدرت نسبی
function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) return 50

  let gains = 0
  let losses = 0

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    if (change >= 0) gains += change
    else losses -= change
  }

  const avgGain = gains / period
  const avgLoss = losses / period

  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

export async function getTechnicalAnalysis(): Promise<AnalysisSignal> {
  // ۱. دریافت قیمت‌های ۳۰ روز اخیر
  const prices = await prisma.priceHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  if (prices.length < 5) {
    return {
      type: "HOLD",
      strength: 0,
      reason: "داده کافی برای تحلیل وجود ندارد",
      technicalScore: 50,
      fundamentalScore: 50,
    }
  }

  const priceValues = prices.map((p) => p.price).reverse()

  // ۲. محاسبه اندیکاتورهای تکنیکال
  const ma5 = calculateSMA(priceValues, 5)
  const ma20 = calculateSMA(priceValues, 20)
  const rsi = calculateRSI(priceValues, 14)

  let type: "BUY" | "SELL" | "HOLD" = "HOLD"
  let strength = 50
  let reason = ""

  const latestMA5 = ma5[ma5.length - 1]
  const latestMA20 = ma20[ma20.length - 1]
  const previousMA5 = ma5[ma5.length - 2]
  const previousMA20 = ma20[ma20.length - 2]

  // تشخیص تقاطع طلایی (Golden Cross)
  if (previousMA5 <= previousMA20 && latestMA5 > latestMA20) {
    type = "BUY"
    strength = 75
    reason = "تقاطع طلایی (Golden Cross) - میانگین ۵ روزه از میانگین ۲۰ روزه عبور کرده است"
  }
  // تشخیص تقاطع مرگ (Death Cross)
  else if (previousMA5 >= previousMA20 && latestMA5 < latestMA20) {
    type = "SELL"
    strength = 75
    reason = "تقاطع مرگ (Death Cross) - میانگین ۵ روزه به زیر میانگین ۲۰ روزه رفته است"
  }
  // RSI اشباع فروش
  else if (rsi < 30) {
    type = "BUY"
    strength = 70
    reason = `RSI در منطقه اشباع فروش (${rsi.toFixed(1)}) - احتمال رشد قیمت`
  }
  // RSI اشباع خرید
  else if (rsi > 70) {
    type = "SELL"
    strength = 70
    reason = `RSI در منطقه اشباع خرید (${rsi.toFixed(1)}) - احتمال اصلاح قیمت`
  }
  // روند صعودی
  else if (latestMA5 > latestMA20 && latestMA5 > previousMA5) {
    type = "BUY"
    strength = 60
    reason = "روند صعودی - میانگین‌های متحرک رو به بالا هستند"
  }
  // روند نزولی
  else if (latestMA5 < latestMA20 && latestMA5 < previousMA5) {
    type = "SELL"
    strength = 60
    reason = "روند نزولی - میانگین‌های متحرک رو به پایین هستند"
  }
  // حالت خنثی
  else {
    type = "HOLD"
    strength = 40
    reason = "بازار در حالت رنج و بدون روند مشخص - توصیه به انتظار"
  }

  // ۳. تحلیل بنیادی (اخبار)
  let fundamentalScore = 50 // پیش‌فرض
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const news = await prisma.newsItem.findMany({
      where: { publishedAt: { gte: sevenDaysAgo } },
    })

    if (news.length > 0) {
      const avgSentiment = news.reduce((sum, n) => sum + n.sentiment, 0) / news.length
      // تبدیل -1..1 به 0..100
      fundamentalScore = Math.round((avgSentiment + 1) * 50)
    }
  } catch (error) {
    console.error("خطا در دریافت اخبار:", error)
  }

  // ۴. ترکیب نهایی
  const technicalScore = Math.round((strength + 50) / 2)

  return {
    type,
    strength,
    reason,
    technicalScore,
    fundamentalScore,
  }
}