"use client"

import Image from "next/image"
import { SyntheticEvent } from "react"
import { ExistingAsset } from "@/types"

interface TokenImageProps extends React.HTMLAttributes<HTMLImageElement> {
  token?: ExistingAsset
  size: number
}

export default function TokenImage({ token, size, ...props }: TokenImageProps) {
  const fallbackSrc = "/medias/fallback_token_image.webp"
  const url = token ? `/medias/tokens/${token.toLowerCase()}.webp` : fallbackSrc

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.currentTarget
    if (target.src !== fallbackSrc) {
      target.onerror = null // Prevent further error handling
      target.src = fallbackSrc
    }
  }

  return <Image {...props} src={url} alt={token || "Token image"} width={size} height={size} onError={handleError} />
}
