import { ProductData } from "@/types"

export const productSplitterData: ProductData = {
  name: "LlamaSplit",
  url: "llama-split",
  header: <ProductBoosterHeader />,
  key: "splitter",
}

export default function ProductBoosterHeader() {
  return (
    <>
      <h1 className="text-5xl">{productSplitterData.name}</h1>
      <div className="flex flex-col  gap-4 font-light pr-28  delay-200">
        <span>Supply crvUSD to Llamalend, and earn the boosted rewards of your choice</span>
      </div>
    </>
  )
}
