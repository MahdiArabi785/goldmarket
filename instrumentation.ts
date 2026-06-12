// instrumentation.ts
import { startCronJobs } from "@/lib/cron"

export function register() {
  // فقط در محیط production یا در سرور اجرا شود
  if (process.env.NEXT_RUNTIME === "nodejs") {
    startCronJobs()
  }
}