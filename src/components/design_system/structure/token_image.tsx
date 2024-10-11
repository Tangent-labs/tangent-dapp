"use client"
import { ExistingAsset } from "@/types"
import Image from "next/image"
import { SyntheticEvent } from "react"

interface TokenImageProps {
  token: ExistingAsset
  size: number
  className?: string
}

export default function TokenImage({ token, size, className = "" }: TokenImageProps) {
  const url = `/medias/tokens/${token.toLowerCase()}.webp`
  return (
    <Image
      src={url}
      alt={token}
      width={size}
      height={size}
      className={className}
      onError={(event: SyntheticEvent<HTMLImageElement, Event>) => {
        event.currentTarget.onerror = null // prevents looping
        event.currentTarget.src = "/medias/fallback_token_image.webp"
      }}
    />
  )
}
