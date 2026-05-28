import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // رفع هشدار workspace root
  turbopack: {
    root: process.cwd(),
  },
  // تنظیمات CORS برای محیط توسعه
  allowedDevOrigins: ['192.168.65.1'],
  // تنظیمات مجاز برای next/image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      // هر hostname دیگری که استفاده می‌کنید اینجا اضافه کنید
    ],
  },
};

export default nextConfig;