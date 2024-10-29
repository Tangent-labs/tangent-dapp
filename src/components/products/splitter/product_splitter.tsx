import { ProductData } from "@/types"

export const productSplitterData: ProductData = {
  name: "LlamaSplit",
  url: "llama-split",
  header: <ProductBoosterHeader />,
  key: "splitter",
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
      <h1 className="text-5xl">{productSplitterData.name}</h1>
      <div className="flex flex-col gap-2 font-light delay-200 xl:pr-28">
        <span>Supply crvUSD to Llamalend, and earn the boosted rewards of your choice</span>
      </div>
    </>
  )
}
