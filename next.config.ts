import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // رفع هشدار workspace root در Turbopack
  turbopack: {
    root: process.cwd(),
  },

  // تنظیمات CORS برای محیط توسعه (دسترسی از Docker یا شبکه محلی)
  allowedDevOrigins: ["192.168.65.1"],

  // تنظیمات بهینه‌سازی تصاویر next/image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      // در صورت نیاز به hostnameهای دیگر می‌توانید اضافه کنید
    ],
    // برای تصاویر محلی (/uploads/*) نیازی به تنظیمات اضافی نیست
  },

  // فعال‌سازی instrumentation hook (برای Cron Jobs خودکار)
  experimental: {
    instrumentationHook: true,
  },

  // تنظیمات webpack برای ماژول‌های خارجی (Prisma)
  webpack: (config) => {
    config.externals = [...(config.externals || []), "@prisma/client"];
    return config;
  },
};

export default nextConfig;