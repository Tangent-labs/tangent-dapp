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

const BOOST_INFOS: NumMap = {
  LP_DEALS: 1,
  DEWHALE_MEMBERS: 0.75,
  ONBOARDED: 0.1,
  LLAMA_NFT: 0.5,
  VECRV: 0.25,
  VLCVX: 0.25,
  VEFXN: 0.25,
  SINV: 0.25,
  STRSUP: 0.25,
  CVG_COMPENSATION: 1,
  CVG_PEPE: 0.75,
}

type BoostMetadata = {
  title: string
  description: string
  logo: string
}

const BOOST_METADATA: Record<string, BoostMetadata> = {
  CVG_COMPENSATION: {
    title: "Convergence boost",
    logo: "CVG",
    description: "Receive a boost for being a CVG OG.",
  },
  LP_DEALS: {
    title: "Pre-Deposit boost",
    logo: "USG",
    description: "You are a member of our private lp deals.",
  },
  CVG_PEPE: {
    title: "NFT boost",
    logo: "PEPE",
    description: "Hold a CVG Pepe NFT to receive this boost.",
  },
  DEWHALE_MEMBERS: {
    title: "Dewhales boost",
    logo: "Dewhales",
    description: "Be a Dewhales member.",
  },
  ONBOARDED: {
    title: "Onboarded User",
    logo: "tangent",
    description: "Get a referral code.",
  },
  LLAMA_NFT: {
    title: "Llama NFT Holder",
    logo: "Llama",
    description: "Llama NFT Holder",
  },
  VECRV: {
    title: "veCRV Holder",
    logo: "CRV",
    description: "veCRV Holder",
  },
  VLCVX: {
    title: "vlCVX Holder",
    logo: "CVX",
    description: "vlCVX Holder",
  },

  VEFXN: {
    title: "veFXN Holder",
    logo: "FX",
    description: "veFXN Holder",
  },
  SINV: {
    title: "sINV Holder",
    logo: "Inverse",
    description: "sINV Holder",
  },
  STRSUP: {
    title: "stRSUP Holder",
    logo: "Resupply",
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
    const logo = metadata?.logo

    return {
      type: title,
      logo: logo,
      boost,
      status: normalizedBoosts.has(normalizedKey),
    }
  }

  return Object.entries(BOOST_INFOS).map(toRow)
}
