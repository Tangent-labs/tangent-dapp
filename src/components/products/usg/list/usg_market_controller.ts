import { Abi, Address, formatUnits, Hex } from "viem"
import MarketListUI from "@/abi/USG/MarketListUI.json"
import { executeChainViewUnique } from "@/services/service_rpc"
import { ExistingAsset, ListHeaderData, ListRowData } from "@/types"
import { USG_CONTRACT, USGMarkets, USGPegKeepers } from "../usg_repository"
import { formatBigInt, formatMarketListCompact, formatDollar, formatPercent } from "@/lib/number_formatter"
import { ChainViewMarketList, ChainViewMarketRow, MarketListAPRData, USGGlobalData } from "../usg_type"

export const getUSGMarketsData = async (address: string) => {
  const markets = USGMarkets.map((market) => market.marketAddress)

  return await executeChainViewUnique<ChainViewMarketList>(MarketListUI.abi as Abi, MarketListUI.bytecode as Hex, [
    address,
    USG_CONTRACT.USG_ORACLE,
    USG_CONTRACT.USG,
    USG_CONTRACT.SUSG,
    markets,
    USGPegKeepers,
    USG_CONTRACT.MARKET_VIEWER,
  ])
}

export const transformMarketData = (data: ChainViewMarketList) => {
  return data.rowInfos.map((el: ChainViewMarketRow) => {
    const staticMarketData = USGMarkets.find((m) => m.marketAddress === el.marketAddress)

    return { marketType: staticMarketData?.marketType, marketAddress: el.marketAddress as Address, constants: el.constants }
  })
}

export function transformGlobalData(data?: ChainViewMarketList): USGGlobalData {
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
    globalTvl: formatDollar(formatUnits(totalTVL, 18), 0),
    globalDebt: formatDollar(formatUnits(totalDebt, 18), 0),
    APY: formatPercent(Number(formatBigInt(data?.USGPercentageInSUSG || "0", 18, 2)) * 100, 2),
  }
}

export function transformToRows(datas: Array<MarketListAPRData>, onChainData: ChainViewMarketList | undefined): ListRowData[] {
  const list: ListRowData[] = []

  datas.forEach((data) => {
    const onChainRow = onChainData?.rowInfos?.find((r) => r.marketAddress === data.marketAddress)
    list.push(transformMarketDataToRow(data, onChainRow))
  })
  return list
}

function transformMarketDataToRow(data: MarketListAPRData, onChainRow?: ChainViewMarketRow): ListRowData {
  let totalCurrentAPR = 0
  let totalProjectedAPR = 0

  if (data && data?.currentAPR && data?.projectedAPR) {
    totalCurrentAPR = Object.values(data?.currentAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number
    totalProjectedAPR = Object.values(data?.projectedAPR).reduce((sum, value) => Number(sum) + Number(value), 0) as number
  }

  const protocol = (USGMarkets.find((m) => m.marketAddress === onChainRow?.marketAddress)?.marketType || "Curve") as string

  const type = onChainRow?.constants.irParams.isHEC ? "HEC" : "LEC"

  return {
    token: data.collateral as ExistingAsset,
    protocol,
    type,
    name: data.collateral,
    address: onChainRow?.marketAddress as Address,
    apr: {
      current: Number(totalCurrentAPR),
      projected: Number(totalProjectedAPR),
    },
    currentAPRDetails: data?.currentAPR,
    indicators: [
      {
        key: "borrowRate",
        label: "Borrow Rate",
        value:
          !!onChainRow?.debtInfos.currentBorrowRate && onChainRow?.debtInfos.currentBorrowRate >= 0n
            ? ((Math.exp(Number(formatBigInt(onChainRow?.debtInfos.currentBorrowRate, 18, 4))) - 1) * 100).toFixed(2) + "%"
            : "0%",
        raw: Number(formatBigInt(onChainRow?.debtInfos.currentBorrowRate, 18, 4)),
      },
      {
        key: "tvl",
        label: "Tvl",
        value: formatMarketListCompact(
          formatUnits(onChainRow?.collateralInfos?.totalCollateralUSDValue || 0n, Number(onChainRow?.collateralInfos?.collateralToken?.decimals) || 18)
        ),
        raw: Number(onChainRow?.collateralInfos?.totalCollateralUSDValue || 0),
      },
      { key: "borrowed", label: "Borrowed", value: formatMarketListCompact(formatUnits(onChainRow?.debtInfos?.totalDebt || 0n, 18)) || "-", raw: 0 },
    ],
    userHasDeposited: !!onChainRow?.collateralInfos?.positionCollateralUSDValue && onChainRow?.collateralInfos?.positionCollateralUSDValue > 0n,
  }
}

export const USGListHeaders: ListHeaderData[] = [
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

export const marketOptions = [
  { label: "All", value: "All" },
  { label: "HEC", value: "HEC" },
  { label: "LEC", value: "LEC" },
]

export const protocolOptions = [
  { label: "All", value: "All" },
  { label: "Curve", value: "Curve" },
  { label: "Convex", value: "Convex" },
  { label: "Pendle", value: "Pendle" },
]

export const USGMarketModalListHeaders: ListHeaderData[] = [
  { label: "LP", key: "lp", sort: null },
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
]
