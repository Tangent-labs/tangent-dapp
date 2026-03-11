import MarketListUI from "@/abi/USG/MarketListUI.json"
import { executeChainViewUnique } from "@/services/service_rpc"
import { Abi, Address, formatEther, formatUnits, Hex } from "viem"
import { ExistingAsset, ListHeaderData, ListRowData } from "@/types"
import { USG_CONTRACT, USGMarkets, USGPegKeepers } from "../usg_repository"
import { formatBigInt, formatMarketListCompact, formatNumber } from "@/lib/number_formatter"
import { ChainViewMarketList, ChainViewMarketRow, MarketListAPRData, USGGlobalData, USGMarketType } from "../usg_type"

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
      usgPriceWei: 0n,
      USGPrice: "-",
      USGSupply: "-",
      sUSGPrice: "-",
      sUSGSupply: "-",
      globalCr: "-",
      globalTvl: "-",
      globalDebt: "-",
    }

  let totalTVL = 0n
  let totalDebt = 0n

  data?.rowInfos.forEach((market) => {
    totalTVL += market.collateralInfos?.totalCollateralUSDValue
    totalDebt += market?.debtInfos.totalDebt
  })

  return {
    usgPriceWei: data?.USGPrice,
    USGPrice: Number(formatEther(data?.USGPrice)).toFixed(4),
    USGSupply: formatBigInt(data?.USGSupply || "0", 18, 0),
    sUSGPrice: `$${Number(formatEther(data?.sUSGPrice)).toFixed(4)}`,
    sUSGSupply: formatBigInt(data?.sUSGSupply || "0", 18, 0),
    globalCr: totalDebt !== 0n ? formatNumber((Number(totalTVL) / Number(totalDebt)) * 100, 2) + "%" : "N/A",
    globalTvl: formatUnits(totalTVL, 18),
    globalDebt: formatUnits(totalDebt, 18),
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

type RewardsApr = Record<string, number>

const IGNORED_KEYS = new Set(["APY"])
const BASE_TOKENS = new Set(["CRV", "CVX", "FXN"])

export function getRewardTokenFromAprDetails(aprDetails: RewardsApr, protocol: string): string {
  if (protocol === "Pendle_PT") {
    return "APY"
  } else {
    if (aprDetails) {
      const tokens = Object.keys(aprDetails).filter((k) => !IGNORED_KEYS.has(k))

      const specialToken = tokens.find((t) => !BASE_TOKENS.has(t))
      if (specialToken) return specialToken

      if (tokens.includes("FXN")) return "FXN"

      return "CRV"
    }
    return "CRV"
  }
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

  const rewardToken = getRewardTokenFromAprDetails(data?.currentAPR, protocol)

  const maxLTV = Number(onChainRow?.constants?.maxLTV) / 100000

  const maxBorrowable = onChainRow?.constants?.maxMarketDebt?.toString() || "0"

  const marketType = onChainRow?.marketType as USGMarketType

  return {
    marketType,
    token: data.collateral as ExistingAsset,
    protocol,
    type,
    name: data.collateral,
    address: data.marketAddress as Address,
    apr: {
      current: Number(totalCurrentAPR),
      projected: protocol === "Pendle_PT" ? Number(totalCurrentAPR) : Number(totalProjectedAPR),
    },
    maxLTV,
    maxBorrowable,
    currentAPRDetails: data?.currentAPR,
    projectedAPRDetails: data?.projectedAPR,
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
      {
        key: "borrowed",
        label: "Borrowed",
        value: formatMarketListCompact(formatUnits(onChainRow?.debtInfos?.totalDebt || 0n, 18)).substring(1, 9) || "-",
        subValue: formatNumber(Number(formatUnits(onChainRow?.constants?.maxMarketDebt || 0n, 18)), 0) || "-",
        raw: Number(formatUnits(onChainRow?.debtInfos?.totalDebt || 0n, 18)),
      },
    ],
    userHasDeposited: !!onChainRow?.collateralInfos?.positionCollateralUSDValue && onChainRow?.collateralInfos?.positionCollateralUSDValue > 0n,
    positionCollateralUSDValue: onChainRow?.collateralInfos?.positionCollateralUSDValue.toString() || "0",
    totalCollateralUSDValue: onChainRow?.collateralInfos?.totalCollateralUSDValue?.toString() || "0",
    rewardToken,
  }
}

export const computeCollatData = (market: ChainViewMarketRow, totalFormatted: number, amountFormatted: number) => {
  const percentage = totalFormatted > 0 ? (amountFormatted / totalFormatted) * 100 : 0
  const marketConfig = USGMarkets.find((m) => m.marketAddress === market.marketAddress)
  const marketNameIsDuplicated = marketConfig != null && USGMarkets.filter((m) => m.marketName === marketConfig.marketName).length > 1
  const displayName = (marketNameIsDuplicated && marketConfig?.marketType === "STAKEDAO_CRV_Vault" ? "s-" : "") + marketConfig?.marketName

  return { displayName, percentage }
}

export const USGListHeaders: ListHeaderData[] = [
  {
    label: "Collateral",
    key: "collateral",
    sort: "sort",
  },
  {
    label: "vAPR",
    key: "vapr",
    sort: "sort",
    indicator: "vAPR of the collateral.",
  },
  {
    label: "Max vAPR",
    key: "maxvapr",
    indicator: "vAPR of the collateral at max leverage.",
    sort: "sort",
  },
  {
    label: "Borrow Rate",
    key: "borrowRate",
    indicator: "Interest rate that borrowers pay on their outstanding debt.",
    sort: "sort",
  },
  { label: "TVL", key: "tvl", sort: "sort" },
  { label: "Borrowed", key: "borrowed", sort: "sort" },
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
  { label: "Stake DAO", value: "Stake DAO" },
  { label: "f(x) Protocol", value: "f(x) Protocol" },
]

export const USGMarketModalListHeaders: ListHeaderData[] = [
  { label: "LP", key: "lp", sort: null },
  {
    label: "vAPR",
    key: "vapr",
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

export const sortMarketListByType = (elementA: ListRowData, elementB: ListRowData, direction: string, maxLeverageA = 1, maxLeverageB = 1) => {
  let computedAPRA = 0
  let computedAPRB = 0

  if (elementA?.protocol === "Pendle_PT") {
    computedAPRA = Number(elementA?.apr?.current)
  } else {
    computedAPRA = Number(elementA?.currentAPRDetails[elementA?.rewardToken]) === 0 ? Number(elementA?.apr?.projected) : Number(elementA?.apr?.current)
  }

  if (elementB?.protocol === "Pendle_PT") {
    computedAPRB = Number(elementB?.apr?.current)
  } else {
    computedAPRB = Number(elementB?.currentAPRDetails[elementB?.rewardToken]) === 0 ? Number(elementB?.apr?.projected) : Number(elementB?.apr?.current)
  }

  if (computedAPRA * maxLeverageA < computedAPRB * maxLeverageB) return direction === "asc" ? -1 : 1
  if (computedAPRA * maxLeverageA > computedAPRB * maxLeverageB) return direction === "asc" ? 1 : -1

  return 0
}

export const sortMarketsByUserPositionAndTVL = (a: ListRowData, b: ListRowData): number => {
  const posA = BigInt(a.positionCollateralUSDValue ?? 0)
  const posB = BigInt(b.positionCollateralUSDValue ?? 0)

  // 1. Prority to user position
  if (posA !== posB) {
    return posA > posB ? -1 : 1
  }

  // else by tvl
  const totalA = BigInt(a.totalCollateralUSDValue ?? 0)
  const totalB = BigInt(b.totalCollateralUSDValue ?? 0)

  if (totalA !== totalB) {
    return totalA > totalB ? -1 : 1
  }

  return 0
}

const TYPE_TO_MARKET: Record<string, string[]> = {
  Convex_CRV: ["Curve", "Convex"],
  Convex_FXN: ["Convex", "f(x) Protocol", "Curve"],
  Pendle_PT: ["Pendle"],
  STAKEDAO_CRV_Vault: ["Stake DAO", "Curve"],
}

export const matchProtocol = (marketProtocol: string, selectedProtocol: string) => {
  if (selectedProtocol === "All") return true

  const mapped = TYPE_TO_MARKET[marketProtocol]

  if (!mapped) return false

  return mapped.includes(selectedProtocol)
}
