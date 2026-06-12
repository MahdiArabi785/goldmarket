"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ShieldAlert, Timer, TimerOff } from "lucide-react"

export function SecurityTimer() {
  const [isActive, setIsActive] = useState(false)
  const [seconds, setSeconds] = useState(30)
  const [warning, setWarning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    if (seconds === 0 && isActive) {
      setIsActive(false)
      setWarning(true)
      toast.error("⚠️ هشدار امنیتی: زمان تحویل طلا به مشتری به پایان رسید!", {
        duration: 10000,
        position: "top-center",
      })
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, seconds])

  const startTimer = () => {
    setIsActive(true)
    setSeconds(30)
    setWarning(false)
    toast.info("⏱️ کرنومتر امنیتی فعال شد - ۳۰ ثانیه فرصت دارید", {
      duration: 3000,
    })
  }

  const stopTimer = () => {
    setIsActive(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    toast.success("کرنومتر امنیتی متوقف شد")
  }

  const resetTimer = () => {
    setWarning(false)
    setSeconds(30)
    setIsActive(false)
  }

  return (
    <Card className={`border-0 shadow-md transition-all ${warning ? "ring-2 ring-red-500 bg-red-50" : isActive ? "ring-2 ring-yellow-500" : ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {warning ? (
            <ShieldAlert className="h-5 w-5 text-red-500" />
          ) : (
            <Shield className="h-5 w-5 text-yellow-600" />
          )}
          کرنومتر امنیتی
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold mb-4 font-mono tabular-nums">
            {isActive ? (
              <span className={seconds <= 10 ? "text-red-500 animate-pulse" : "text-yellow-600"}>
                {seconds}
              </span>
            ) : (
              <span className="text-gray-400">۳۰</span>
            )}
            <span className="text-lg text-gray-500"> ثانیه</span>
          </div>

          <div className="flex gap-2 justify-center">
            {!isActive && !warning && (
              <Button onClick={startTimer} className="gap-2 bg-yellow-500 hover:bg-yellow-600">
                <Timer className="h-4 w-4" />
                فعال‌سازی
              </Button>
            )}

            {isActive && (
              <Button onClick={stopTimer} variant="outline" className="gap-2 text-red-600">
                <TimerOff className="h-4 w-4" />
                توقف
              </Button>
            )}

            {warning && (
              <Button onClick={resetTimer} className="gap-2 bg-green-500 hover:bg-green-600">
                <Shield className="h-4 w-4" />
                رفع خطر
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            هنگام تحویل طلا به مشتری، این کرنومتر را فعال کنید. در صورت اتمام زمان، هشدار امنیتی صادر می‌شود.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}