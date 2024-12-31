import { ProductKey, ProductData } from "@/types"
import { productBoosterData } from "@/components/products/booster/product_booster"
import { productSplitterData } from "@/components/products/splitter/product_splitter"
import { productWrapperData } from "@/components/products/wrapper/product_wrapper"
import { productgUsdData } from "@/components/products/tg_usd/product_tg_usd"

export const productsData: Record<ProductKey, ProductData> = [productgUsdData, productBoosterData, productSplitterData, productWrapperData].reduce(
  (agg, p) => {
    agg[p.key] = p
    return agg
  },
  {} as Record<ProductKey, ProductData>
)
