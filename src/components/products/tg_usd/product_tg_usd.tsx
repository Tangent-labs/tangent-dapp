import { ProductData } from "@/types"

export const productgUsdData: ProductData = {
  name: "tgUSD",
  url: "",
  header: <ProductBoosterHeader />,
  key: "tgUsd",
  defaultFeature: "deposit",
  features: [
    {
      key: "list",
      isGlobal: true,
      label: "markets",
    },
    {
      key: "deposit",
      isGlobal: false,
    },
    {
      key: "borrow",
      isGlobal: false,
    },
    {
      key: "repay",
      isGlobal: false,
    },
    {
      key: "withdraw",
      isGlobal: false,
    },
    {
      key: "liquidate",
      isGlobal: false,
    },
    {
      key: "stake",
      isGlobal: true,
    },
    {
      key: "earn",
      isGlobal: true,
    },
    {
      key: "points",
      isGlobal: true,
    },
    {
      key: "buy",
      isGlobal: true,
    },
  ],
}

export default function ProductBoosterHeader() {
  return (
    <>
      <h1 className="text-5xl">{productgUsdData.name}</h1>
      <div className="flex flex-col gap-2 font-light delay-200 xl:pr-28">
        <span>
          Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools (SDT
          stable pool & CVX stable pool)
        </span>
        <span>Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs. Learn more</span>
      </div>
    </>
  )
}
