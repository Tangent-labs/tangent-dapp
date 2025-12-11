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

  const tokenStartsWith = token?.substring(0, token.indexOf(" "))

  if (tokenStartsWith === "USDe") {
    return <ImageWithFallback {...props} fallback={fallbackSrc} src={`/medias/tokens/USDe.webp`} alt={token || "Token image"} width={size} height={size} />
  }

  if (tokenStartsWith === "sUSDe") {
    return <ImageWithFallback {...props} fallback={fallbackSrc} src={`/medias/tokens/sUSDe.webp`} alt={token || "Token image"} width={size} height={size} />
  }

  const url = token ? `/medias/tokens/${token}.webp` : fallbackSrc

  return <ImageWithFallback {...props} fallback={fallbackSrc} src={url} alt={token || "Token image"} width={size} height={size} />
}
