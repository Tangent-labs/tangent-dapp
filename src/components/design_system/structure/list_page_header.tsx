"use client"

import { productsData } from "@/components/products/products"
import { ProductData, ProductKey } from "@/types"
import Image from "next/image"

type PageHeaderProps = {
  product: ProductKey
}

export function PageHeader({ product }: PageHeaderProps) {
  const productData: ProductData = productsData[product]

  return (
    <div className="an-page-header flex w-full gap-10 bg-right xl:h-48">
      <div className="an-bg hidden items-center justify-end bg-[url('/medias/header_bg.png')] bg-right bg-no-repeat lg:w-2/5 xl:flex">
        <Image
          height={360}
          width={360}
          quality={100}
          className="an-logo h-[180px] w-[180px]"
          src={`/medias/product_${product.toLowerCase()}.png`}
          alt="splitter"
        />
      </div>
      <div className="an-text flex w-full flex-col gap-5 xl:w-3/5">{productData.header}</div>
    </div>
  )
}
