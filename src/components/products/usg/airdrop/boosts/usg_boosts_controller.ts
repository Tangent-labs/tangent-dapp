import { ListHeaderData } from "@/types"
import { Boost } from "../../usg_type"

export type NumMap = {
  [key: string]: number
}

export const boostHeaders: ListHeaderData[] = [
  { label: "Type", key: "type" },
  { label: "Description", key: "description" },
  { label: "Boost", key: "boost" },
  { label: "Status", key: "status" },
]

const OFFCHAIN_BOOST_INFOS: NumMap = {
  CVG_COMPENSATION: 1,
  LP_DEALS: 1,
  CVG_PEPE: 0.75,
  DEWHALE_MEMBERS: 0.75,
  TURTLE_CLUB: 0.5,
  ONBOARDED: 0.1,
}

const ONCHAIN_BOOST_INFOS: NumMap = {
  STAKING: 1,
  LLAMA_NFT_HOLDER: 0.5,
  VECRV_HOLDER: 0.25,
  VLCVX_HOLDER: 0.25,
  VESDT_HOLDER: 0.25,
  VEFXN_HOLDER: 0.25,
  VEPENDLE_HOLDER: 0.25,
  VEYFI_HOLDER: 0.25,
  SINV_HOLDER: 0.25,
  STRESOLV_HOLDER: 0.25,
  STRSUP_HOLDER: 0.25,
}

type BoostMetadata = {
  title: string
  description: string
}

const BOOST_METADATA: Record<string, BoostMetadata> = {
  CVG_COMPENSATION: {
    title: "CVG Compensation Boost",
    description: "Receive a boost for being a CVG OG.",
  },
  LP_DEALS: {
    title: "LP Deals Boost",
    description: "Access exclusive liquidity provider deals.",
  },
  CVG_PEPE: {
    title: "Pepe Booster",
    description: "Hold CVG Pepe assets to receive this boost.",
  },
  DEWHALE_MEMBERS: {
    title: "Dewhales Boost",
    description: "Be a Dewhales member.",
  },
  TURTLE_CLUB: {
    title: "Turtle Club Boost",
    description: "Be a Turtle Club member.",
  },
  ONBOARDED: {
    title: "Onboarded User",
    description: "You used a referral code.",
  },
  STAKING: {
    title: "Staking Boost",
    description: "Stake tokens to earn rewards and boost your power.",
  },
  LLAMA_NFT_HOLDER: {
    title: "Llama NFT Holder",
    description: "Llama NFT Holder",
  },
  VECRV_HOLDER: {
    title: "veCRV Holder",
    description: "veCRV Holder",
  },
  VLCVX_HOLDER: {
    title: "vlCVX Holder",
    description: "vlCVX Holder",
  },
  VESDT_HOLDER: {
    title: "veSDT Holder",
    description: "veSDT Holder",
  },
  VEFXN_HOLDER: {
    title: "veFXN Holder",
    description: "veFXN Holder",
  },
  VEPENDLE_HOLDER: {
    title: "vePENDLE Holder",
    description: "vePENDLE Holder",
  },
  VEYFI_HOLDER: {
    title: "veYFI Holder",
    description: "veYFI Holder",
  },
  SINV_HOLDER: {
    title: "sINV Holder",
    description: "sINV Holder",
  },
  STRESOLV_HOLDER: {
    title: "stRESOLV Holder",
    description: "stRESOLV Holder",
  },
  STRSUP_HOLDER: {
    title: "stRSUP Holder",
    description: "stRSUP Holder",
  },
}

const normalizeKey = (input: string): string => input.trim().replace(/\s+/g, "_").toUpperCase()

export const mapUserBoosts = (boosts: string[]): Boost[] => {
  const normalizedBoosts = new Set(boosts.map(normalizeKey))

  const toRow = ([rawKey, boost]: [string, number]): Boost => {
    const normalizedKey = normalizeKey(rawKey)
    const metadata = BOOST_METADATA[normalizedKey]

    const title = metadata?.title
    const description = metadata?.description

    return {
      type: title,
      description,
      boost,
      status: normalizedBoosts.has(normalizedKey),
    }
  }

  const offChainBoosts = Object.entries(OFFCHAIN_BOOST_INFOS).map(toRow)
  const onChainBoosts = Object.entries(ONCHAIN_BOOST_INFOS).map(toRow)

  return offChainBoosts.concat(onChainBoosts)
}
