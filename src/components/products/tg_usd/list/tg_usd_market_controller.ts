import { ExistingAsset, ListHeaderData, ListRowData } from "@/types"
import { ChainViewMarketList, ChainViewMarketRow, TgUsdGlobalData, TgUsdMarketData, TgUsdMarketDataUser } from "../tg_usd_type"
import { formatBigInt, formatDollar, formatPercent } from "@/lib/number_formatter"
import { TGUSD_CONTRACT, tgUsdMarkets } from "../tg_usd_repository"
import { Abi, Address, Hex, parseUnits, zeroAddress } from "viem"

import MarketListUI from "@/abi/tgusd/MarketListUI.json"
import { executeChainViewUnique } from "@/services/service_rpc"

export const getTgUsdMarketsData = async (address: Address | undefined) => {
  const markets = tgUsdMarkets.map((market) => market.marketAddress)
  address = address || zeroAddress
  return await executeChainViewUnique<ChainViewMarketList>(MarketListUI.abi as Abi, MarketListUI.bytecode as Hex, [
    address,
    TGUSD_CONTRACT.TG_USD_ORACLE,
    TGUSD_CONTRACT.TG_USD,
    markets,
  ])
}

export function getMarketDatas() {
  return tgUsdMarkets.map((market) => ({
    network: "mainnet",
    marketAddress: market.marketAddress,
    platforms: ["convex", "curve"],
    collateral: market.marketName,
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
  })) as (TgUsdMarketData & TgUsdMarketDataUser)[]
}

export function transformGlobalData(data?: ChainViewMarketList): TgUsdGlobalData {
  if (!data)
    return {
      tgUsdPrice: "-",
      tgUsdSupply: "-",
      sgUsdPrice: "-",
      sgUsdSupply: "-",
      globalCr: "-",
      globalTvl: "-",
      APY: "-",
    }

  const tgUsdPrice = Number(formatBigInt(data?.tgUSDPrice || "0", 18, 5))

  return {
    tgUsdPrice: formatDollar(tgUsdPrice, 2),
    tgUsdSupply: formatBigInt(data?.tgUSDSupply || "0", 18, 0),
    sgUsdPrice: formatDollar(formatBigInt(data?.sgUSDPrice || "0", 18, 2), 2),
    sgUsdSupply: formatBigInt(data?.sgUSDSupply || "0", 18, 0),
    globalCr: formatBigInt(data?.tgUSDPercentageInSgUSD || "0", 18, 2),
    globalTvl: formatDollar(Number(parseUnits(data?.sgUSDSupply?.toString() || "0", 18)) * tgUsdPrice) || "-",
    APY: formatPercent(Number(formatBigInt(data?.tgUSDPercentageInSgUSD || "0", 18, 2)) * 100, 2),
  }
}

export function transformToRows(datas: (TgUsdMarketData & TgUsdMarketDataUser)[], onChainData: ChainViewMarketList | undefined): ListRowData[] {
  const list: ListRowData[] = []

  datas.forEach((data) => {
    const onChainRow = onChainData?.rowInfos?.find((r) => r.marketAddress === data.marketAddress)
    // console.log("transformToRows", onChainData?.rowInfos, data)
    list.push(transformMarketDataToRow(data, onChainRow))
  })
  return list
}

function transformMarketDataToRow(data: TgUsdMarketData & TgUsdMarketDataUser, onChainRow?: ChainViewMarketRow): ListRowData {
  //console.log("transformMarketDataToRow", data, onChainRow)

  const health = BigInt(onChainRow?.debtInfos?.totalDebt || "0") > 0n ? formatBigInt(onChainRow?.debtInfos?.healthRatio, 18, 0) : "-"

  return {
    token: data.collateral as ExistingAsset,
    name: data.collateral,
    apr: {
      current: Number(data.apr.details.baseApr),
      projected: Number(data.apr.details.baseApr),
    },
    indicators: [
      { key: "borrowRate", label: "Borrow Rate", value: formatBigInt(onChainRow?.debtInfos.actualBorrowRate, 18, 0) || "-", raw: 0 },
      {
        key: "tvl",
        label: "Tvl",
        value: formatDollar(formatBigInt(onChainRow?.collateralInfos?.totalCollateralUSDValue, 18, 2)),
        raw: Number(onChainRow?.collateralInfos?.totalCollateralUSDValue || 0),
      },
      { key: "borrowed", label: "Borrowed", value: formatBigInt(onChainRow?.debtInfos?.totalDebt, 18, 0) || "-", raw: data.borrowed },
      { key: "cap", label: "Cap", value: formatBigInt(onChainRow?.constants?.maxMarketDebt, 18, 0) || "-", raw: data.cap },
      { key: "debt", label: "Debt", value: formatBigInt(onChainRow?.debtInfos?.totalDebt, 18, 0) || "-", raw: Number(onChainRow?.debtInfos?.totalDebt) },
      {
        key: "health",
        label: "Health",
        value: health,
        raw: health === "-" ? 0 : Number(health),
      },
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
