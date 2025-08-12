"use client"

import Image from "next/image"

export default function TgUsdAirdropLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex w-full flex-col items-center justify-between">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="sgusd-card w-1/2">
          <div className="flex items-center justify-center">
            <Image height={320} width={320} className="an-logo" src="/medias/product_tgusd.png" alt="token" />
          </div>
          <div className="flex flex-col items-start justify-center gap-3">
            <span className="text-[48px] font-semibold">Tasks</span>
            <p>
              Borrow tgUSD, provide liquidity, and vote for tgUSD and sgUSD pools to earn points. Points will be convertible for TAN tokens once the campaign
              ends.
            </p>
          </div>
        </div>

        <div className="flex w-1/2 flex-col items-stretch justify-between gap-6">
          <div className="flex h-full w-full flex-col items-start justify-start gap-8 rounded-[10px] bg-overlay-panel backdrop-blur-[60px]">
            <div className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+40px)_center] bg-no-repeat px-6 !text-[20px] !font-semibold italic">
              Points campaign
              <div className="ml-2 flex items-center justify-center rounded-[10px] bg-tonic px-2 py-0.5 !font-semibold !not-italic !text-black">Live</div>
            </div>
          </div>

          <div className="w-ful flex items-center justify-between gap-4">
            <div className="relative flex flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-8 py-3 backdrop-blur-[60px]">
              <div className="absolute -top-2 left-0 flex w-full">
                <div className="mx-4 flex w-full items-center justify-between rounded-full bg-black">
                  <div className="px-2 text-xs italic">boost x1.1</div>
                  <div className="rounded-full bg-tonic px-6 text-xs font-semibold text-black">Vote</div>
                </div>
              </div>

              <span className="text-[14px] text-subtitle">Voting points</span>
              <div className="flex items-center justify-center gap-1 text-[20px]">
                <span className="font-semibold text-white">1385 pts</span>
                <span className="text-sm text-tonic">(30pts/day)</span>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center rounded-[10px] bg-overlay-panel px-8 py-3 backdrop-blur-[60px]">
              <div className="absolute -top-2 left-0 flex w-full">
                <div className="mx-4 flex w-full items-center justify-between rounded-full bg-black">
                  <div className="px-2 text-xs italic">boost x1.5</div>
                  <div className="rounded-full bg-pink px-6 text-xs font-semibold text-black">Liquidity</div>
                </div>
              </div>

              <span className="text-[14px] text-subtitle">Liquidity points</span>
              <div className="flex items-center justify-center gap-1 text-[20px]">
                <span className="font-semibold text-white">9,385 pts</span>
                <span className="text-sm text-tonic">(30pts/day)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
