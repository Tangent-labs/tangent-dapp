import { ExistingAsset, ListHeaderData, ListRowData } from "@/types"
import { TgUsdGlobalData, TgUsdMarketData, TgUsdMarketDataUser } from "../tg_usd_type"
import { formatDollar, formatNumber, formatPercent } from "@/lib/number_formatter"

export function getMarketDatas() {
  return [
    {
      network: "mainnet",
      platforms: ["convex", "curve"],
      collateral: "TRICRV",
      apr: {
        details: {
          baseApr: 0.03,
          boostApr: 0.02,
          type: "variable",
        },
        totalApr: 0.05,
      },
      borrowRate: 0.03,
      tvl: 20000000,
      borrowed: 15000000,
      cap: 25000000,
      debt: 10000000,
      health: 1.5,
    },
    {
      network: "mainnet",
      platforms: ["curve"],
      collateral: "CVX",
      apr: {
        details: {
          baseApr: 0.025,
          boostApr: 0.015,
          type: "fixed",
        },
        totalApr: 0.04,
      },
      borrowRate: 0.025,
      tvl: 15000000,
      borrowed: 12000000,
      cap: 20000000,
      debt: 10000000,
      health: 1.1,
    },
    {
      network: "mainnet",
      platforms: ["convex"],
      collateral: "FXN",
      apr: {
        details: {
          baseApr: 0.04,
          boostApr: 0.02,
          type: "variable",
        },
        totalApr: 0.06,
      },
      borrowRate: 0.035,
      tvl: 18000000,
      borrowed: 14000000,
      cap: 23000000,
      debt: 10000000,
      health: 1.2,
    },
  ] as (TgUsdMarketData & TgUsdMarketDataUser)[]
}

export const mockTgUsdGlobalData: TgUsdGlobalData = {
  tgUsdPrice: 1.02, // TG USD price in dollars
  tgUsdsupply: 500000, // TG USD supply
  sgUsdprice: 0.98, // SG USD price in dollars
  sgUsdsupply: 300000, // SG USD supply
  globalCr: 150, // Global collateral ratio in percentage
  GlobalTvl: 1200000, // Total value locked in dollars
  APY: 0.02, // Annual Percentage Yield
}

export function transformMarketDataToRows(data: TgUsdMarketData & TgUsdMarketDataUser): ListRowData {
  return {
    token: data.collateral as ExistingAsset,
    name: data.collateral,
    apr: {
      current: Number(data.apr.details.baseApr),
      projected: Number(data.apr.details.baseApr),
    },
    indicators: [
      { key: "borrowRate", label: "Borrow Rate", value: formatPercent(data.borrowRate, 2), raw: 0 },
      { key: "tvl", label: ` ${data.tvl} USD`, value: formatDollar(data.tvl, 0), raw: data.tvl },
      { key: "borrowed", label: "Borrowed", value: formatDollar(data.borrowed, 0), raw: data.borrowed },
      { key: "cap", label: "Cap", value: formatDollar(data.cap, 0), raw: data.cap },
      { key: "debt", label: "Debt", value: formatDollar(data.debt, 0), raw: data.debt },
      { key: "health", label: "Health", value: formatNumber(data.health, 0), raw: data.health },
    ],
  }
}

export const tgUsdListHeaders: ListHeaderData[] = [
  { label: "Collateral", key: "collateral" },
  { label: "APR", key: "apr" },
  { label: "Borrow Rate", key: "borrowRate" },
  { label: "TVL", key: "tvl" },
  { label: "Borrowed", key: "borrowed" },
  { label: "Cap", key: "cap" },
  { label: "Debt", key: "debt" },
  { label: "Health", key: "health" },
]
