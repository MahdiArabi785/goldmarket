import type { Metadata } from "next"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "GoldMarket - بازار هوشمند طلا",
  description: "سامانه هوشمند معاملات طلا - خرید و فروش طلای نو، دست دوم و آب شده",
  keywords: "طلا, خرید طلا, فروش طلا, بازار طلا, قیمت طلا, طلای دست دوم, طلای آب شده",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className="light" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground antialiased")}>
        <Providers>
          {children}
          <Toaster 
            position="top-center" 
            richColors 
            closeButton 
            dir="rtl"
            toastOptions={{
              style: {
                fontFamily: 'inherit',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}