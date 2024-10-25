import { ProductKey, ProductData } from "@/types"
import { productBoosterData } from "./pages/booster/product_booster"
import { productSplitterData } from "./pages/splitter/product_splitter"
import { productWrapperData } from "./pages/wrapper/product_wrapper"

export const productsData: Record<ProductKey, ProductData> = [productBoosterData, productSplitterData, productWrapperData].reduce(
  (agg, p) => {
    agg[p.key] = p
    return agg
  },
  {} as Record<ProductKey, ProductData>
)
