import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import Link from "next/link"

type CollateralEmissionLabelProps = {
  isHEC: boolean
  isFixedRate?: boolean
}

const DOCS = {
  FIR: "https://docs.tangent.finance/docs/usg/Markets/fir_markets",
  HEC: "https://docs.tangent.finance/docs/usg/Markets/hec_markets#hec-markets",
  LEC: "https://docs.tangent.finance/docs/usg/Markets/lec_markets",
}

export const CollateralEmissionLabel = ({ isHEC, isFixedRate }: CollateralEmissionLabelProps) => {
  const type = isFixedRate ? "FIR" : isHEC ? "HEC" : "LEC"

  return (
    <div className="flex items-center justify-center text-white transition duration-200">
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <span className="flex h-6 items-center justify-center rounded-full bg-overlay-panel px-2 py-0.5 text-xs backdrop-blur-[60px] hover:bg-white/10">
            {type}
          </span>
        </HoverCardTrigger>
        <HoverCardContent side="top" align="center" className="z-[9999] p-2 text-sm">
          This market is an {type} market. Learn more about {type} in the
          <Link
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="ml-1 cursor-pointer underline hover:text-white/40"
            href={DOCS[type]}
            target="_blank"
            rel="noopener noreferrer"
          >
            docs.{" "}
          </Link>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
