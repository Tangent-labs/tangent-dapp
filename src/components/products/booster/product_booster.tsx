import { ProductData } from "@/types"

export const productBoosterData: ProductData = {
  name: "sdTokens booster",
  url: "sdtokens-booster",
  header: <ProductBoosterHeader />,
  key: "booster",
  defaultFeature: "deposit",
  features: [
    {
      key: "deposit",
      isGlobal: false,
    },
    {
      key: "withdraw",
      isGlobal: false,
    },
    {
      key: "claim",
      isGlobal: true,
    },
    {
      key: "harvest",
      isGlobal: true,
    },
  ],
}

export default function ProductBoosterHeader() {
  return (
    <>
      <h1 className="text-5xl">{productBoosterData.name}</h1>
      <div className="flex flex-col gap-2 font-light delay-200 xl:pr-28">
        <span>Deposit your Stake DAO&apos;s sdTokens, and benefit from Tangent&apos;s socialized boost to enhance your earnings.</span>
        <span>
          Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs.{"  "}
          <span className="underline">Learn more</span>
        </span>
      </div>
    </>
  )
}
