import { Address } from "viem"
import { USG_CONTRACT } from "../usg_repository"

export type SavingsVault = {
  key: "sUSG" | "sUSG-reUSD"
  asset: { symbol: string; logo: string; address: Address }
  share: { symbol: string; logo: string; address: Address }
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

export const SAVINGS_VAULTS: Record<SavingsVault["key"], SavingsVault> = {
  sUSG: {
    key: "sUSG",
    asset: { symbol: "USG", logo: "USG", address: USG_CONTRACT.USG },
    share: { symbol: "sUSG", logo: "sUSG", address: USG_CONTRACT.SUSG },
    title: "Savings account",
    description: "Stake USG to receive sUSG and earn yield passively. sUSG is an ERC4626 token and can be used further in DeFi.",
    image: "/medias/tokens/SUSG.png",
    docsHref: "https://docs.tangent.finance/docs/usg/overview_usg#savings-account%E2%80%8B",
    docsLabel: "Learn more about sUSG",
    depositLabel: "Stake",
    withdrawLabel: "Unstake",
    hasData: true,
  },
  "sUSG-reUSD": {
    key: "sUSG-reUSD",
    asset: { symbol: "sUSG/reUSD", logo: "sUSG-reUSD", address: "0xc6ac08424ee6d1373f03611b96f5da849594b6d8" },
    share: { symbol: "sUSGre", logo: "sUSG-reUSD", address: "0x81bc65e2ca41722f3ecda4235226fa16703e714e" },
    title: "sUSGre",
    description: "Deposit sUSG/reUSD Curve LP to receive sUSGre, a Yearn vault that auto-compounds its rewards, and earn yield passively.",
    image: "/medias/tokens/sUSGre.png",
    docsHref: "https://etherscan.io/address/0x81bc65e2ca41722f3ecda4235226fa16703e714e",
    docsLabel: "View vault contract",
    depositLabel: "Deposit",
    withdrawLabel: "Withdraw",
    hasData: false,
  },
}
