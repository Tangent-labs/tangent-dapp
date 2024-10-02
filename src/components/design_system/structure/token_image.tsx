"use client";
import { ExistingAsset } from "@/types";
import Image from "next/image";

interface TokenImageProps {
  token: ExistingAsset;
  size: number;
  className?: string;
}

export default function TokenImage({
  token,
  size,
  className = "",
}: TokenImageProps) {
  const url = `/medias/tokens/${token.toLowerCase()}.webp`;
  return (
    <Image
      src={url}
      alt={token}
      width={size}
      height={size}
      className={className}
    />
  );
}
