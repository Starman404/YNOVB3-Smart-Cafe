'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface Props {
  tableNumber: number
  size?: number
}

export function QRCodeDisplay({ tableNumber, size = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // URL que le client scannera pour accéder à sa table
  const url = `${process.env.NEXT_PUBLIC_CLIENT_APP_URL ?? 'https://ynovb-3-smart-cafe.vercel.app'}/landing?table=${tableNumber}`

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
  }, [url, size])

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} aria-label={`QR Code table ${tableNumber}`} />
      <p className="text-xs text-muted-foreground break-all text-center max-w-[160px]">
        {url}
      </p>
    </div>
  )
}