import type { ListHeaderData, ListRowData } from "@/types"

const headers: ListHeaderData[] = [
  { label: "Strategy", key: "strategy" },
  { label: "APR", key: "apr" },
  { label: "Boost", key: "boost" },
  { label: "TVL", key: "tvl" },
  { label: "Deposited", key: "deposited" },
  { label: "Claimable", key: "claimable" },
]

const listData: ListRowData[] = [
  {
    token: "CRV",
    name: "CRV",
    apr: {
      current: 60.5,
      projected: 70.2,
    },
    indicators: [
      { key: "boost", label: "Boost", value: "2.5x veCRV", raw: 2.5 },
      { key: "tvl", label: "TVL", value: "$2,500,000", raw: 2500000 },
      { key: "deposited", label: "Deposited", value: "$2,500,000", raw: 2500000 },
      { key: "claimable", label: "Claimable", value: "$2,500,000", raw: 2500000 },
    ],
  },
  {
    token: "WETH",
    name: "WETH",
    apr: {
      current: 55.3,
      projected: 65.0,
    },
    indicators: [
      { key: "boost", label: "Boost", value: "2.2x veDAI", raw: 2.2 },
      { key: "tvl", label: "TVL", value: "$1,800,000", raw: 1800000 },
      { key: "deposited", label: "Deposited", value: "$1,800,000", raw: 1800000 },
      { key: "claimable", label: "Claimable", value: "$1,500,000", raw: 1500000 },
    ],
  },
  {
    token: "PENDLE",
    name: "PENDLE",
    apr: {
      current: 50.25,
      projected: 58.75,
    },
    indicators: [
      { key: "boost", label: "Boost", value: "1.8x veUSDC", raw: 1.8 },
      { key: "tvl", label: "TVL", value: "$3,000,000", raw: 3000000 },
      { key: "deposited", label: "Deposited", value: "$3,000,000", raw: 3000000 },
      { key: "claimable", label: "Claimable", value: "$2,000,000", raw: 2000000 },
    ],
  },
  {
    token: "ETH",
    name: "ETH",
    apr: {
      current: 72.5,
      projected: 85.0,
    },
    indicators: [
      { key: "boost", label: "Boost", value: "3.0x veETH", raw: 3.0 },
      { key: "tvl", label: "TVL", value: "$4,200,000", raw: 4200000 },
      { key: "deposited", label: "Deposited", value: "$4,200,000", raw: 4200000 },
      { key: "claimable", label: "Claimable", value: "$3,500,000", raw: 3500000 },
    ],
  },
]

export const getGrid1Data = async () => {
  return new Promise<{ headers: ListHeaderData[]; rows: ListRowData[] }>((resolve) => {
    setTimeout(() => resolve({ headers, rows: listData }), 0)
  })
}
