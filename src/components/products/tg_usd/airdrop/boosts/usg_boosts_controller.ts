import { ListHeaderData } from "@/types"

export type NumMap = {
  [key: string]: number
}

export const boostHeaders: ListHeaderData[] = [
  { label: "Type", key: "type" },
  { label: "Description", key: "description" },
  { label: "Boost", key: "boost" },
  { label: "Status", key: "status" },
]

export const mapUserBoosts = (boosts: string[]) => {
  const normalizedBoosts = new Set(boosts.map(normalizeKey))

  const offChainBoosts = Object.entries(OFFCHAIN_BOOST_INFOS).map(([key, boost]) => ({
    type: "offchain",
    description: key,
    boost,
    status: normalizedBoosts.has(key),
  }))

  const onChainBoosts = Object.entries(ONCHAIN_BOOST_INFOS).map(([key, boost]) => ({
    type: "onchain",
    description: key,
    boost,
    status: normalizedBoosts.has(key),
  }))

  return offChainBoosts.concat(onChainBoosts)
}

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
  LOCKED_LP: 0.5,
}

const normalizeKey = (input: string): string => input.trim().replace(/\s+/g, "_").toUpperCase()
