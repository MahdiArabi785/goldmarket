// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(amount))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * تبدیل امن فیلد images از JSON String به آرایه رشته‌ها
 * در صورت بروز هرگونه خطا، آرایه‌ای حاوی placeholder.svg بازمی‌گرداند
 */

export function parseImagesSafe(imagesRaw: any): string[] {
  try {
    if (typeof imagesRaw === 'string') {
      const parsed = JSON.parse(imagesRaw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } else if (Array.isArray(imagesRaw)) {
      return imagesRaw.length > 0 ? imagesRaw : ["/placeholder.svg"]
    }
  } catch {
    // nothing
  }
  return ["/placeholder.svg"]
}