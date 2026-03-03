import Image from "next/image"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface TokenImageProps extends React.HTMLAttributes<HTMLImageElement> {
  token: string
  size: 16 | 20 | 24
}

export default function TokenImageHighlighted({ token, size, ...props }: TokenImageProps) {
  const tokens: Record<string, { name: string; link: string }> = {
    CRV: {
      name: "Curve",
      link: "https://www.curve.finance/",
    },
    CVX: {
      name: "Convex",
      link: "https://www.convexfinance.com/",
    },
    SDT: {
      name: "StakeDAO",
      link: "https://www.stakedao.org/",
    },
    PENDLE: {
      name: "Pendle",
      link: "https://app.pendle.finance/",
    },
    FXN: {
      name: "f(x) Protocol",
      link: "https://fx.aladdin.club/",
    },
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
        <HoverCardContent side="top" align="center" className="z-[9999] flex justify-center border border-white/10 text-sm">
          This market is built on top of
          <span
            className="ml-1 cursor-pointer text-white hover:text-white/30"
            onClick={(e) => {
              e?.stopPropagation()
              e?.preventDefault()
              window.open(tokens[token]?.link, "_blank", "noopener,noreferrer")
            }}
          >
            {tokens[token]?.name}.
          </span>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
