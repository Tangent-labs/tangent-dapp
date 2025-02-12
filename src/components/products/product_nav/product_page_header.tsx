import Image from "next/image"
import React from "react"
import { cn } from "@/lib/utils"

export default function ProductPageHeader() {
  return (
    <div className={cn("mb-4 flex content-center")}>
      <div className="an-page-header flex w-full gap-10 bg-right xl:h-48">
        <div className="an-bg hidden items-center justify-end bg-[url('/medias/header_bg.png')] bg-right bg-no-repeat lg:w-2/5 xl:flex">
          <Image height={360} width={360} quality={100} className="an-logo h-[180px] w-[180px]" src={`/medias/product_tgUSD.png`} alt="splitter" />
        </div>
        <div className="an-text flex w-full flex-col gap-5 xl:w-3/5">
          <h1 className="text-5xl">tgUSD</h1>
          <div className="flex flex-col gap-2 font-light delay-200 xl:pr-28">
            <span>
              Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools (SDT
              stable pool & CVX stable pool)
            </span>
            <span>Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs. Learn more</span>
          </div>
        </div>
      </div>
    </div>
  )
}
