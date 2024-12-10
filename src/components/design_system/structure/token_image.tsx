"use client"
import { ExistingAsset } from "@/types"
import Image from "next/image"
import { SyntheticEvent } from "react"

interface TokenImageProps extends React.HTMLAttributes<HTMLImageElement> {
  token: ExistingAsset
  size: number
}

export default function TokenImage({ token, size, ...props }: TokenImageProps) {
  const url = token ? `/medias/tokens/${token.toLowerCase()}.webp` : "/medias/fallback_token_image.webp"
  return (
    <Image
      {...props}
      src={url}
      alt={token}
      width={size}
      height={size}
      onError={(event: SyntheticEvent<HTMLImageElement, Event>) => {
        event.currentTarget.onerror = null // prevents looping
        event.currentTarget.src = "/medias/fallback_token_image.webp"
      }}
    />
  )
}
