import { USGMarketType } from "@/components/products/usg/usg_type"

export type PlatformInfo = {
  name: string
  type: string
  logoPath: string
  website: string
  twitter: string
  description: string
}

export const PLATFORM_INFOS: Record<string, PlatformInfo> = {
  Curve: {
    name: "Curve",
    type: "AMM",
    logoPath: "/medias/tokens/CRV.webp",
    website: "https://curve.fi",
    twitter: "https://twitter.com/curvefinance",
    description: "Curve is an AMM optimized for stablecoin and pegged-asset trading, offering low slippage and sustainable yield for liquidity providers.",
  },
  Convex: {
    name: "Convex",
    type: "Yield Optimizer",
    logoPath: "/medias/tokens/CVX.webp",
    website: "https://www.convexfinance.com",
    twitter: "https://twitter.com/ConvexFinance",
    description:
      "Convex is a yield optimizer that maximizes Curve LP rewards by pooling CRV boosting power across depositors, without requiring users to lock CRV directly.",
  },
  Pendle: {
    name: "Pendle",
    type: "Yield Trading",
    logoPath: "/medias/tokens/PENDLE.webp",
    website: "https://www.pendle.finance",
    twitter: "https://twitter.com/pendle_fi",
    description:
      "Pendle is a yield trading protocol that allows users to split, trade, and manage the yield of yield-bearing assets through fixed and variable rate strategies.",
  },
  StakeDAO: {
    name: "Stake DAO",
    type: "Yield Optimizer",
    logoPath: "/medias/tokens/SDT.webp",
    website: "https://stakedao.org",
    twitter: "https://twitter.com/StakeDAOHQ",
    description:
      "Stake DAO is a yield optimizer that maximizes Curve LP rewards by pooling CRV boosting power across depositors, without requiring users to lock CRV directly.",
  },
  "f(x)": {
    name: "f(x)",
    type: "CDP",
    logoPath: "/medias/logos/FX.webp",
    website: "https://fx.aladdin.club",
    twitter: "https://twitter.com/protocol_fx",
    description:
      "f(x) Protocol is a decentralized on-chain trading platform that enables stress-free leverage on ETH and WBTC while delivering organic & sustainable yield on stablecoins.",
  },
}

export const MARKET_TYPE_TO_PLATFORMS: Record<USGMarketType, string[]> = {
  Convex_CRV: ["Curve", "Convex"],
  Convex_FXN: ["Curve", "Convex", "f(x)"],
  Pendle_PT: ["Pendle"],
  STAKEDAO_CRV_Vault: ["Curve", "StakeDAO"],
  CRV_Gauge: ["Curve"],
}
