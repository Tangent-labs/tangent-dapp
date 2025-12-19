"use client"

import { ImageProps } from "next/image"
import { useEffect, useState } from "react"
import { ExistingAsset } from "@/types"

interface TokenImageProps extends React.HTMLAttributes<HTMLImageElement> {
  token?: ExistingAsset
  size: 8 | 12 | 16 | 20 | 24 | 32 | 48 | 64 | 96 | 128 | 256 | 384
}

interface ImageWithFallbackProps extends Omit<ImageProps, "src"> {
  src: string // Required source for the image
  fallback?: string // Optional fallback image
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  fallback, // Default fallback image path
  src,
  alt,
  ...props
}) => {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false) // Reset error state when `src` changes
  }, [src])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt}
      src={hasError ? fallback : src}
      onError={() => setHasError(true)} // Set error to true if the image fails to load
    />
  )
}

export default function TokenImage({ token, size, ...props }: TokenImageProps) {
  const fallbackSrc = "/medias/fallback_token_image.webp"

  if (!token) {
    return <ImageWithFallback {...props} fallback={fallbackSrc} src={fallbackSrc} alt="Token image" width={size} height={size} />
  }

  const prefix = token
    .substring(0, token.lastIndexOf(" ") === -1 ? token.length : token.lastIndexOf(" "))
    .trim()
    .toUpperCase()

  const specialImages: Record<string, string> = {
    USDE: "USDE.webp",
    "LP USDE": "USDE.webp",
    "PT USDE": "PT_USDe.webp",
    "YT USDE": "YT_USDe.webp",
    SUSDE: "SUSDE.webp",
    "LP SUSDE": "SUSDE.webp",
    "PT SUSDE": "PT_sUSDe.webp",
    "YT SUSDE": "YT_sUSDe.webp",
  }

  const imageFilename = specialImages[prefix] || `${token}.webp`

  const src = `/medias/tokens/${imageFilename}`

  return <ImageWithFallback {...props} fallback={fallbackSrc} src={src} alt={token} width={size} height={size} />
}
