"use client"

import Image, { ImageProps } from "next/image"
import { useEffect, useState } from "react"
import { ExistingAsset } from "@/types"

interface TokenImageProps extends React.HTMLAttributes<HTMLImageElement> {
  token?: ExistingAsset
  size: 16 | 32 | 48 | 64 | 96 | 128 | 256 | 384
}

interface ImageWithFallbackProps extends Omit<ImageProps, "src"> {
  src: string // Required source for the image
  fallback?: string // Optional fallback image
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  fallback = "/fallback-image.png", // Default fallback image path
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
  const url = token ? `/medias/tokens/${token.toLowerCase()}.webp` : fallbackSrc

  return <ImageWithFallback {...props} src={url} alt={token || "Token image"} width={size} height={size} />
}
