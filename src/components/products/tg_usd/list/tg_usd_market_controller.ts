import { ExistingAsset, ListHeaderData, ListRowData } from "@/types"
import { ChainViewMarketList, ChainViewMarketRow, TgUsdGlobalData, TgUsdMarketData, TgUsdMarketDataUser } from "../tg_usd_type"
import { formatBigInt, formatDollar, formatPercent } from "@/lib/number_formatter"
import { USG_CONTRACT, USGMarkets, tgUsdPegKeepers } from "../tg_usd_repository"
import { Abi, Address, formatUnits, Hex } from "viem"
import MarketListUI from "@/abi/USG/MarketListUI.json"
import { executeChainViewUnique } from "@/services/service_rpc"

export const getTgUsdMarketsData = async (address: Address | undefined) => {
  const markets = USGMarkets.map((market) => market.marketAddress)

  return await executeChainViewUnique<ChainViewMarketList>(MarketListUI.abi as Abi, MarketListUI.bytecode as Hex, [
    address,
    USG_CONTRACT.USG_ORACLE,
    USG_CONTRACT.USG,
    USG_CONTRACT.SUSG,
    markets,
    tgUsdPegKeepers,
  ])
}

export const transformMarketData = (data: ChainViewMarketList) => {
  return data.rowInfos.map((el: ChainViewMarketRow) => {
    const staticMarketData = USGMarkets.find((m) => m.marketAddress === el.marketAddress)

    return { marketType: staticMarketData?.marketType, marketAddress: el.marketAddress as Address, constants: el.constants }
  })
}

export function getMarketDatas() {
  return USGMarkets.map((market) => ({
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
      USGPrice: "-",
      USGSupply: "-",
      sUSGPrice: "-",
      sUSGSupply: "-",
      globalCr: "-",
      globalTvl: "-",
      globalDebt: "-",
      APY: "-",
    }

  const USGPrice = Number(formatBigInt(data?.USGPrice || "0", 18, 5))

  let totalTVL = 0n
  let totalDebt = 0n

  data?.rowInfos.forEach((market) => {
    totalTVL += market.collateralInfos?.totalCollateralUSDValue
    totalDebt += market?.debtInfos.totalDebt
  })

  return {
    USGPrice: USGPrice.toFixed(3),
    USGSupply: formatBigInt(data?.USGSupply || "0", 18, 0),
    sUSGPrice: formatDollar(formatBigInt(data?.sUSGPrice || "0", 18, 2), 2),
    sUSGSupply: formatBigInt(data?.sUSGSupply || "0", 18, 0),
    globalCr: totalDebt !== 0n ? ((Number(totalTVL) / Number(totalDebt)) * 100).toFixed(2) + "%" : "N/A",
    globalTvl: formatDollar(formatUnits(totalTVL, 18)),
    globalDebt: formatDollar(formatUnits(totalDebt, 18)),
    APY: formatPercent(Number(formatBigInt(data?.USGPercentageInSUSG || "0", 18, 2)) * 100, 2),
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
      { key: "borrowRate", label: "Borrow Rate", value: formatBigInt(onChainRow?.debtInfos.currentBorrowRate, 18, 0) || "-", raw: 0 },
      {
        key: "tvl",
        label: "Tvl",
        value: formatDollar(formatUnits(onChainRow?.collateralInfos?.totalCollateralUSDValue || 0n, 18), 0),
        raw: Number(onChainRow?.collateralInfos?.totalCollateralUSDValue || 0),
      },
      { key: "borrowed", label: "Borrowed", value: formatDollar(formatUnits(onChainRow?.debtInfos?.totalDebt || 0n, 18), 0) || "-", raw: data.borrowed },
    ],
    userHasDeposited: !!onChainRow?.collateralInfos?.positionCollateralUSDValue && onChainRow?.collateralInfos?.positionCollateralUSDValue > 0n,
  }
}

export const tgUsdListHeaders: ListHeaderData[] = [
  { label: "Collateral", key: "collateral", sort: null },
  {
    label: "APR",
    key: "apr",
    indicator: "vAPR of the collateral",
    sort: "sort",
  },
  {
    label: "Borrow Rate",
    key: "borrowRate",
    indicator: "Interest rate that borrowers pay on their outstanding debt.",
    sort: "sort",
  },
  { label: "TVL", key: "tvl", sort: "sort" },
  { label: "Borrowed", key: "borrowed", sort: null },
]
