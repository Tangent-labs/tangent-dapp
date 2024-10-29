import { productsData } from "@/components/products/products"
import { ProductData, ProductKey } from "@/types"
import Image from "next/image"

type PageHeaderProps = {
  product: ProductKey
}

export function PageHeader({ product }: PageHeaderProps) {
  const productData: ProductData = productsData[product]

  return (
    <div className="flex gap-10 h-48 bg-right w-full an-page-header">
      <div className="w-2/5  bg-[url('/medias/header_bg.png')] bg-no-repeat bg-right flex justify-end items-center an-bg">
        <Image height={360} width={360} quality={100} className="w-[180px] h-[180px] an-logo" src={`/medias/product_${product}.png`} alt="splitter" />
      </div>
      <div className="w-3/5 flex  flex-col gap-5 an-text ">{productData.header}</div>
    </div>
  )
}
