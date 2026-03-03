import Image from "next/image"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface TokenImageProps extends React.HTMLAttributes<HTMLImageElement> {
  token: string
  size: 16 | 20 | 24
}

export default function TokenImageHighlighted({ token, size, ...props }: TokenImageProps) {
  const tokens: Record<string, string> = {
    CRV: "Curve",
    CVX: "Convex",
    SDT: "Stake DAO",
    PENDLE: "Pendle",
    FXN: "f(x) Protocol",
  }

  const src = `/medias/tokens/${token}.webp`

  return (
    <div className="flex items-center text-white transition duration-200">
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Image
            className="flex items-center justify-center rounded-full bg-overlay-panel p-1.5 backdrop-blur-[60px]"
            {...props}
            src={src}
            alt={token}
            width={size}
            height={size}
          />
        </HoverCardTrigger>
        <HoverCardContent side="top" align="center" className="z-[9999] flex justify-center border border-white/10 p-2 text-sm">
          {tokens[token]}
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
