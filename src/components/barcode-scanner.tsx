'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function BarcodeScanner({ onScan }: { onScan: (barcode: string) => void }) {
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const startScanning = async () => {
    scannerRef.current = new Html5Qrcode('reader')
    setScanning(true)
    
    await scannerRef.current.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        onScan(decodedText)
        stopScanning()
      },
      () => {}
    )
  }

  const stopScanning = () => {
    scannerRef.current?.stop()
    setScanning(false)
  }

  useEffect(() => () => { stopScanning() }, [])

  return (
    <Card className="p-4">
      <div id="reader" className="w-full max-w-sm mx-auto" />
      <div className="flex gap-2 mt-4 justify-center">
        <Button onClick={startScanning} disabled={scanning}>
          شروع اسکن
        </Button>
        <Button variant="outline" onClick={stopScanning} disabled={!scanning}>
          توقف
        </Button>
      </div>
    </Card>
  )
}