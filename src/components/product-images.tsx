"use client"

import { useState } from "react"
import Image from "next/image"
import { cn, parseImagesSafe } from "@/lib/utils"

interface ProductImagesProps {
  images: string[] | string
  name: string
}

export function ProductImages({ images, name }: ProductImagesProps) {
  const parsedImages = parseImagesSafe(images)
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
        <Image
          src={parsedImages[selectedIndex]}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {parsedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {parsedImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all",
                index === selectedIndex
                  ? "border-yellow-500 ring-2 ring-yellow-200"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Image
                src={image}
                alt={`${name} - تصویر ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}