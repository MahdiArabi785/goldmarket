"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Camera, CameraOff } from "lucide-react"

export function BarcodeScanner({ onScan }: { onScan: (barcode: string) => void }) {
  const [scanning, setScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState(true)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    // بررسی وجود دوربین
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length === 0) {
          setHasCamera(false)
        }
      })
      .catch(() => setHasCamera(false))

    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      scannerRef.current = new Html5Qrcode("reader")
      setScanning(true)

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText)
          stopScanning()
        },
        () => {}
      )
    } catch {
      setScanning(false)
      setHasCamera(false)
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear()
      })
    }
    setScanning(false)
  }

  if (!hasCamera) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">دوربین در دسترس نیست</p>
        <p className="text-sm text-gray-400 mt-2">
          می‌توانید بارکد را به صورت دستی وارد کنید
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div id="reader" className="w-full max-w-sm mx-auto rounded-lg overflow-hidden" />
      <div className="flex gap-2 mt-4 justify-center">
        {!scanning ? (
          <Button onClick={startScanning} className="gap-2">
            <Camera className="h-4 w-4" />
            شروع اسکن
          </Button>
        ) : (
          <Button variant="outline" onClick={stopScanning} className="gap-2">
            <CameraOff className="h-4 w-4" />
            توقف
          </Button>
        )}
      </div>
      {scanning && (
        <div className="flex items-center justify-center gap-2 mt-4 text-yellow-600">
          <Loader2 className="animate-spin h-4 w-4" />
          <span className="text-sm">در حال اسکن...</span>
        </div>
      )}
    </Card>
  )
}