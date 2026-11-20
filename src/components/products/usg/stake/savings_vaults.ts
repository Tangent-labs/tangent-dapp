import { Address } from "viem"
import { USG_CONTRACT } from "../usg_repository"

export type SavingsVault = {
  key: "sUSG" | "sUSGre" | "sUSGdo" | "sUSGfr" | "sUSGus" | "sUSGou"
  source: "Tangent" | "Yearn V3"
  asset: { symbol: string; logo: string; address: Address }
  share: { symbol: string; logo: string; address: Address }
  // listing card
  subtitle: string
  summary: string
  depositTokens?: string
  // detail page
  title: string
  description: string
  image: string
  docsHref: string
  docsLabel: string
  depositLabel: string
  withdrawLabel: string
  // false = no backend APY / history yet: APY and charts stay empty
  hasData: boolean
}

const yearnV3 = (key: SavingsVault["key"], share: Address, asset: Address, pair: [string, string]): SavingsVault => ({
  key,
  source: "Yearn V3",
  asset: { symbol: `${pair[0]}/${pair[1]}`, logo: `${pair[0]}-${pair[1]}`, address: asset },
  share: { symbol: key, logo: key, address: share },
  subtitle: `${pair[0]} / ${pair[1]} LP`,
  summary: `sUSG/${pair[1]} Curve pool wrapped in a Yearn V3 vault. ${pair[0]} and ${pair[1]} exposure.`,
  depositTokens: pair.join(", "),
  title: key,
  description: `Deposit ${pair[0]}/${pair[1]} Curve LP to receive ${key}, a Yearn V3 vault that auto-compounds its rewards, and earn yield passively.`,
  image: `/medias/tokens/${key}.webp`,
  docsHref: `https://etherscan.io/address/${share}`,
  docsLabel: "View vault contract",
  depositLabel: "Deposit",
  withdrawLabel: "Withdraw",
  hasData: false,
})

export const SAVINGS_VAULTS: Record<SavingsVault["key"], SavingsVault> = {
  sUSG: {
    key: "sUSG",
    source: "Tangent",
    asset: { symbol: "USG", logo: "USG", address: USG_CONTRACT.USG },
    share: { symbol: "sUSG", logo: "sUSG", address: USG_CONTRACT.SUSG },
    subtitle: "Staked USG",
    summary: "sUSG: Tangent's native savings account. USG exposure only.",
    title: "Savings account",
    description: "Stake USG to receive sUSG and earn yield passively. sUSG is an ERC4626 token and can be used further in DeFi.",
    image: "/medias/tokens/SUSG.png",
    docsHref: "https://docs.tangent.finance/docs/usg/overview_usg#savings-account%E2%80%8B",
    docsLabel: "Learn more about sUSG",
    depositLabel: "Stake",
    withdrawLabel: "Unstake",
    hasData: true,
  },
  sUSGre: yearnV3("sUSGre", "0x52dc6dcba1ab37405fe5e94242e7dccbc824b3c4", "0xC6ac08424eE6D1373F03611b96f5Da849594B6D8", ["sUSG", "reUSD"]),
  sUSGdo: yearnV3("sUSGdo", "0x5dd0f0067eab130c869d9715dbf96aed35832c2b", "0x317837AED98bea887074d1f97Fd3C83eBCA6905b", ["USG", "sDOLA"]),
  sUSGfr: yearnV3("sUSGfr", "0x91198f4eaee829712374c17aa7c731255d3b26d7", "0xEfc056790bb19702b2164ec6Ea6bA3AE01d81195", ["USG", "frxUSD"]),
  sUSGus: yearnV3("sUSGus", "0xebb7ff2cc9b71acba91f05af9a7990dd8a2d8dc8", "0x97BA10115da528c113462EDE9C20D7adc806D93f", ["USG", "USDC"]),
  sUSGou: yearnV3("sUSGou", "0x067b16b4a573f5200e7526fb33bd92690dc1c972", "0xf182fE2f1a1014543848E261087B6740b78Acf71", ["USG", "OUSD"]),
}

export const isSavingsVaultKey = (key: string): key is SavingsVault["key"] => key in SAVINGS_VAULTS
