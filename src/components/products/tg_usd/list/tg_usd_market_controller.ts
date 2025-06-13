import { ExistingAsset, ListHeaderData, ListRowData } from "@/types"
import { ChainViewMarketList, ChainViewMarketRow, TgUsdGlobalData, TgUsdMarketData, TgUsdMarketDataUser } from "../tg_usd_type"
import { formatBigInt, formatDollar, formatPercent } from "@/lib/number_formatter"
import { TGUSD_CONTRACT, tgUsdMarkets, tgUsdPegKeepers } from "../tg_usd_repository"
import { Abi, Address, formatUnits, Hex } from "viem"
import MarketListUI from "@/abi/tgusd/MarketListUI.json"
import { executeChainViewUnique } from "@/services/service_rpc"

export const getTgUsdMarketsData = async (address: Address | undefined) => {
  const markets = tgUsdMarkets.map((market) => market.marketAddress)

  return await executeChainViewUnique<ChainViewMarketList>(MarketListUI.abi as Abi, MarketListUI.bytecode as Hex, [
    address,
    TGUSD_CONTRACT.TG_USD_ORACLE,
    TGUSD_CONTRACT.TG_USD,
    TGUSD_CONTRACT.SG_USD,
    markets,
    tgUsdPegKeepers,
  ])
}

export const transformMarketData = (data: ChainViewMarketList) => {
  const filteredData = data.rowInfos.map((el: ChainViewMarketRow) => {
    const staticMarketData = tgUsdMarkets.find((m) => m.marketAddress === el.marketAddress)

    return { ...el, marketType: staticMarketData?.marketType }
  })

  return filteredData
}

export function getMarketDatas() {
  return tgUsdMarkets.map((market) => ({
    network: "mainnet",
    marketAddress: market.marketAddress,
    platforms: ["convex", "curve"],
    collateral: market.marketName,
    apr: {
      details: {
        baseApr: 0.3,
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
      globalDebt: "-",
      APY: "-",
    }

  const tgUsdPrice = Number(formatBigInt(data?.tgUSDPrice || "0", 18, 5))

  let totalTVL = 0n
  let totalDebt = 0n

  data?.rowInfos.forEach((market) => {
    totalTVL += market.collateralInfos?.positionCollateralUSDValue
    totalDebt += market?.debtInfos.totalDebt
  })

  return {
    tgUsdPrice: tgUsdPrice.toFixed(3),
    tgUsdSupply: formatBigInt(data?.tgUSDSupply || "0", 18, 0),
    sgUsdPrice: formatDollar(formatBigInt(data?.sgUSDPrice || "0", 18, 2), 2),
    sgUsdSupply: formatBigInt(data?.sgUSDSupply || "0", 18, 0),
    globalCr: totalDebt !== 0n ? ((Number(totalTVL) / Number(totalDebt)) * 100).toFixed(2) + "%" : "N/A",
    globalTvl: formatDollar(formatUnits(totalTVL, 18)),
    globalDebt: formatDollar(formatUnits(totalDebt, 18)),
    APY: formatPercent(Number(formatBigInt(data?.tgUSDPercentageInSgUSD || "0", 18, 2)) * 100, 2),
  }
}

export function transformToRows(datas: (TgUsdMarketData & TgUsdMarketDataUser)[], onChainData: ChainViewMarketList | undefined): ListRowData[] {
  const list: ListRowData[] = []

  datas.forEach((data) => {
    const onChainRow = onChainData?.rowInfos?.find((r) => r.marketAddress === data.marketAddress)
    list.push(transformMarketDataToRow(data, onChainRow))
  })
  return list
}

function transformMarketDataToRow(data: TgUsdMarketData & TgUsdMarketDataUser, onChainRow?: ChainViewMarketRow): ListRowData {
  return {
    token: data.collateral as ExistingAsset,
    name: data.collateral,
    address: onChainRow?.marketAddress as Address,
    apr: {
      current: Number(data.apr.details.baseApr),
      projected: Number(data.apr.details.baseApr),
    },
    indicators: [
      { key: "borrowRate", label: "Borrow Rate", value: formatBigInt(onChainRow?.debtInfos.currentBorrowRate, 18, 2) || "-", raw: 0 },
      {
        key: "tvl",
        label: "Tvl",
        value: formatDollar(formatUnits(onChainRow?.collateralInfos?.totalCollateralUSDValue || 0n, 18)),
        raw: Number(onChainRow?.collateralInfos?.totalCollateralUSDValue || 0),
      },
      { key: "borrowed", label: "Borrowed", value: formatDollar(formatUnits(onChainRow?.debtInfos?.totalDebt || 0n, 18)) || "-", raw: data.borrowed },
      { key: "cap", label: "Cap", value: formatBigInt(onChainRow?.constants?.maxMarketDebt, 18, 0) || "-", raw: data.cap },
    ],
  }
}

export const tgUsdListHeaders: ListHeaderData[] = [
  { label: "Collateral", key: "collateral" },
  {
    label: "APR",
    key: "apr",
    indicator:
      "Annualized cost of borrowing, expressed as a percentage, which includes the interest rate and any additional fees or costs associated with the loan",
  },
  {
    label: "Borrow Rate",
    key: "borrowRate",
    indicator:
      "Interest rate charged by a lender to a borrower for the use of borrowed funds, typically expressed as a percentage of the principal loan amount.",
  },
  { label: "TVL", key: "tvl" },
  { label: "Borrowed", key: "borrowed" },
  { label: "Cap", key: "cap" },
]
