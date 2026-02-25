import { ListHeaderData } from "@/types"
import { Boost } from "../../usg_type"

export type NumMap = {
  [key: string]: number
}

export const boostHeaders: ListHeaderData[] = [
  { label: "Type", key: "type" },
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
  LLAMA_NFT: 0.5,
  VECRV: 0.25,
  VLCVX: 0.25,
  VESDT: 0.25,
  VEFXN: 0.25,
  VEPENDLE: 0.25,
  VEYFI: 0.25,
  SINV: 0.25,
  STRESOLV: 0.25,
  STRSUP: 0.25,
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
    description: "You are a member of our private lp deals.",
  },
  CVG_PEPE: {
    title: "Pepe Booster",
    description: "Hold a CVG Pepe NFT to receive this boost.",
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
    description: "Get a referral code.",
  },
  LLAMA_NFT: {
    title: "Llama NFT Holder",
    description: "Llama NFT Holder",
  },
  VECRV: {
    title: "veCRV Holder",
    description: "veCRV Holder",
  },
  VLCVX: {
    title: "vlCVX Holder",
    description: "vlCVX Holder",
  },
  VESDT: {
    title: "veSDT Holder",
    description: "veSDT Holder",
  },
  VEFXN: {
    title: "veFXN Holder",
    description: "veFXN Holder",
  },
  VEPENDLE: {
    title: "vePENDLE Holder",
    description: "vePENDLE Holder",
  },
  VEYFI: {
    title: "veYFI Holder",
    description: "veYFI Holder",
  },
  SINV: {
    title: "sINV Holder",
    description: "sINV Holder",
  },
  STRESOLV: {
    title: "stRESOLV Holder",
    description: "stRESOLV Holder",
  },
  STRSUP: {
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

    return {
      type: title,
      boost,
      status: normalizedBoosts.has(normalizedKey),
    }
  }

  const offChainBoosts = Object.entries(OFFCHAIN_BOOST_INFOS).map(toRow)
  const onChainBoosts = Object.entries(ONCHAIN_BOOST_INFOS).map(toRow)

  return offChainBoosts.concat(onChainBoosts)
}
