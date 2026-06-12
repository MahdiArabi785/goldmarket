"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ShieldAlert, Activity } from "lucide-react"

export function AntiTheftSensor() {
  const [sensorActive, setSensorActive] = useState(false)
  const [alarmTriggered, setAlarmTriggered] = useState(false)

  const toggleSensor = () => {
    if (!sensorActive) {
      setSensorActive(true)
      setAlarmTriggered(false)
      toast.success("حسگر ضد سرقت فعال شد")
    } else {
      setSensorActive(false)
      setAlarmTriggered(false)
      toast.info("حسگر ضد سرقت غیرفعال شد")
    }
  }

  const simulateTheft = () => {
    if (sensorActive) {
      setAlarmTriggered(true)
      toast.error("🚨 هشدار سرقت! حسگر فعال شد!", {
        duration: 10000,
        position: "top-center",
      })
    } else {
      toast.warning("ابتدا حسگر را فعال کنید")
    }
  }

  const resetAlarm = () => {
    setAlarmTriggered(false)
    toast.success("هشدار ریست شد")
  }

  return (
    <Card className={`border-0 shadow-md transition-all ${alarmTriggered ? "ring-2 ring-red-500 bg-red-50" : ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {alarmTriggered ? (
            <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />
          ) : sensorActive ? (
            <Shield className="h-5 w-5 text-green-500" />
          ) : (
            <Shield className="h-5 w-5 text-gray-400" />
          )}
          حسگر ضد سرقت
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">وضعیت حسگر:</span>
            <span className={`font-bold ${sensorActive ? "text-green-600" : "text-gray-400"}`}>
              {sensorActive ? "فعال" : "غیرفعال"}
            </span>
          </div>

          {alarmTriggered && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center animate-pulse">
              <ShieldAlert className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 font-bold">⚠️ هشدار سرقت!</p>
              <p className="text-red-600 text-sm">حسگر امنیتی فعال شده است</p>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <Button
              onClick={toggleSensor}
              variant={sensorActive ? "outline" : "default"}
              className={sensorActive ? "" : "bg-green-500 hover:bg-green-600"}
            >
              {sensorActive ? "غیرفعال کردن" : "فعال کردن حسگر"}
            </Button>

            {sensorActive && !alarmTriggered && (
              <Button onClick={simulateTheft} variant="outline" className="text-red-600">
                شبیه‌سازی سرقت
              </Button>
            )}

            {alarmTriggered && (
              <Button onClick={resetAlarm} className="bg-red-500 hover:bg-red-600">
                ریست هشدار
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            {sensorActive
              ? "حسگر فعال است. در صورت باز شدن غیرمجاز ویترین، هشدار ارسال می‌شود."
              : "برای محافظت از طلاها، حسگر را فعال کنید."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}