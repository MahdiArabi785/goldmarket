"use server"

import { prisma } from "@/lib/prisma"
import Sentiment from "sentiment"

const NEWS_API_KEY = process.env.NEWS_API_KEY || "your-api-key"
const sentiment = new Sentiment()

export async function fetchAndAnalyzeNews() {
  try {
    const url = `https://newsapi.org/v2/everything?q=gold+OR+طلا+OR+precious+metals&language=en&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`
    const res = await fetch(url)
    const data = await res.json()

    if (data.status !== "ok") throw new Error("خطا در دریافت اخبار")

    for (const article of data.articles) {
      const existing = await prisma.newsItem.findFirst({
        where: { title: article.title },
      })
      if (existing) continue // از ثبت تکراری جلوگیری کند

      const analysis = sentiment.analyze(article.title + " " + (article.description || ""))
      const sentimentScore = analysis.comparative // عددی بین -1 تا 1

      await prisma.newsItem.create({
        data: {
          title: article.title,
          content: article.description || "",
          url: article.url,
          sentiment: sentimentScore,
          publishedAt: new Date(article.publishedAt),
        },
      })
    }

    console.log("✅ اخبار اقتصادی تحلیل و ذخیره شدند")
  } catch (error) {
    console.error("❌ خطا در دریافت/تحلیل اخبار:", error)
  }
}