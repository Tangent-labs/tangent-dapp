"use client"

import ListAPR from "@/components/design_system/list_apr"
import ListAsset from "@/components/design_system/list_asset"
import ListHeader from "@/components/design_system/list_header"
import ListIndicator from "@/components/design_system/list_indicator"
import ListRow from "@/components/design_system/list_row"
import { ListRowData } from "@/types"

const Home = () => {
  // Define headers for the list
  const headers = [
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
      name: "CRV+COLLAT",
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
      assetsEarned: [{ token: "DAI" }, { token: "USDC" }],
    },
    {
      token: "DAI",
      name: "DAI+COLLAT",
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
      assetsEarned: [{ token: "CRV" }],
    },
    {
      token: "USDC",
      name: "USDC+COLLAT",
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
      assetsEarned: [{ token: "DAI" }],
    },
    {
      token: "ETH",
      name: "ETH+COLLAT",
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
      assetsEarned: [{ token: "USDC" }, { token: "DAI" }],
    },
  ]

  return (
    <>
      {/* Render the list header */}
      <ListHeader headers={headers} />

      {/* Render the rows of data */}
      {listData.map((item, index) => (
        <ListRow key={index}>
          <ListAsset name={item.name} token={item.token} assetsEarned={[{ token: "DAI" }, { token: "USDC" }]} />
          <ListAPR apr={item.apr.current} projectedApr={item.apr.projected} />
          <>
            {item.indicators.map((i) => (
              <ListIndicator label={i.label} value={i.value} key={i.key} />
            ))}
          </>
        </ListRow>
      ))}
    </>
  )
}

export default Home
