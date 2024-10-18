import { ProductData } from "@/types"

export const productWrapperData: ProductData = {
  name: "Liquid wrappers",
  url: "liquid-wrappers",
  header: <ProductWrapperHeader />,
  key: "wrapper",
}

export default function ProductWrapperHeader() {
  return (
    <>
      <h1 className="text-5xl">{productWrapperData.name}</h1>
      <div className="flex flex-col  gap-4 font-light pr-28  delay-200">
        <span>
          Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools (SDT
          stable pool & CVX stable pool).
        </span>
        <span>
          Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs.
          <span className="underline">Learn more</span>
        </span>
      </div>
    </>
  )
}
