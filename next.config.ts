import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // تنظیمات Turbopack برای رفع هشدار workspace root
  turbopack: {
    root: process.cwd(),
  },

  // تنظیمات CORS برای محیط توسعه
  allowedDevOrigins: ["192.168.65.1"],

  // تنظیمات بهینه‌سازی تصاویر
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
      {
         protocol: "https",
         hostname: "res.cloudinary.com" 
      },
    ],
  },
};

export default nextConfig;