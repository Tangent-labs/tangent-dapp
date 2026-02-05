"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { useUSGContext } from "../usg_context"
import { ListState } from "@/types"
import { useRootContext } from "../../root/root_context"
import Divider from "@/components/design_system/structure/divider"
import ListAsset from "@/components/design_system/list/list_asset"
import { useUSGMaketListContext } from "./usg_market_list_context"
import { formatDollar, formatNumber } from "@/lib/number_formatter"
import InputSelect from "@/components/design_system/inputs/input_select"
import InputSearch from "@/components/design_system/inputs/input_search"
import TokenImage from "@/components/design_system/structure/token_image"
import MarketListAPR from "@/components/design_system/list/market_list_apr"
import LargeButtonTab from "@/components/design_system/inputs/large_button_tab"
import { MarketListRow } from "@/components/design_system/list/market_list_row"
import { MarketListHeader } from "@/components/design_system/list/market_list_header"
import { marketOptions, protocolOptions, USGListHeaders } from "./usg_market_controller"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { Fragment, ReactNode } from "react"
import Link from "next/link"

interface ListRowDispositionProps {
  children: React.ReactNode[]
}

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "collateral",
    direction: "asc",
  },
}

const MarketListSelectTemplate = (option: { label: string; value: string }) => {
  return <span className="flex w-full cursor-pointer items-center rounded-[10px] px-3 text-sm font-semibold text-white hover:bg-white/10">{option?.label}</span>
}

const CustomMarketListRow = ({ children }: ListRowDispositionProps) => {
  return (
    <div className="flex items-center justify-between max-xl:flex-col">
      <div className="flex w-full items-center justify-between xl:w-1/2 xl:justify-start">
        <div className="xl:w-1/2">{children?.at(0)}</div>
        <div className="hidden items-center justify-center xl:flex xl:w-1/4">{children?.at(1)}</div>
        <div className="hidden items-center justify-center xl:flex xl:w-1/4">{children?.at(2)}</div>
      </div>
      <hr className="my-2 w-full opacity-20 xl:hidden" />
      <div className="flex w-full items-center justify-evenly gap-2 xl:w-1/2">
        <div className="flex w-full flex-col items-center justify-evenly gap-2 xl:hidden">
          {children?.at(1)}
          {children?.at(2)}
          {children?.at(3)}
        </div>

        <div className="hidden w-full items-center justify-evenly gap-2 xl:flex">{children?.at(3)}</div>
      </div>
    </div>
  )
}

export function NeonLightCard(props: { color1: string; color2: string; className: string; children: ReactNode }) {
  return (
    <div className={`flex overflow-hidden rounded-lg ${props.className}`}>
      <div
        className="shadow-2x relative w-full rounded-lg px-4 py-2"
        style={{
          background: `
          linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03)), radial-gradient(50.04% 50% at 50.04% 100%, ${props.color1} 0%,rgba(0, 0, 0, 0) 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{
            padding: "1px",
            background: `
            radial-gradient(49.97% 49.97% at 50.03% 100%, #FFFFFF 0%,
            ${props.color2} 19.71%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%,
            rgba(255, 255, 255, 0.1) 100%)`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {props.children}
      </div>
    </div>
  )
}

interface KeyValue {
  key: string
  value: string
}
export function ThreeCardRowWithMask(props: { contents: [KeyValue, KeyValue, KeyValue] }) {
  const color1 = "#0077ff67"
  const color2 = "#0075FF"

  return (
    <div className="relative w-full pt-2">
      {/* Cards with individual backgrounds positioned to create continuity */}
      <div className="relative grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative overflow-hidden rounded-lg">
            {/* Continuous background image - positioned to align across all cards */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'url("./medias/card_bg_blocks.png")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.2,
                // Make background span the full width and shift it
                left: `calc(-${i * 100}% - ${i * 1}rem)`,
                width: "calc(300% + 2rem)",
              }}
            />

            {/* Continuous gradient - centered at 50% of the TOTAL width (middle card) */}
            <div
              className="absolute inset-0"
              style={{
                left: `calc(-${i * 100}% - ${i * 1}rem)`,
                width: "calc(300% + 2rem)",
                background: `
                  linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03)), 
                  radial-gradient(50.04% 50% at 50% 100%, ${color1} 0%, rgba(0, 0, 0, 0) 100%)
                `,
              }}
            />

            {/* Border gradient for this card - ALSO continuous */}
            <div
              className="pointer-events-none absolute inset-0 rounded-lg"
              style={{
                padding: "1px",
                left: `calc(-${i * 100}% - ${i * 1}rem)`,
                width: "calc(300% + 2rem)",
                background: `
                  radial-gradient(49.97% 49.97% at 50% 100%, #FFFFFF 0%,
                  ${color2} 19.71%, rgba(0, 0, 0, 0) 100%), 
                  linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%,
                  rgba(255, 255, 255, 0.1) 100%)
                `,
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />

            <div className="relative z-10 px-4 py-4 text-center">
              <h3 className="mb-1 text-xs text-subtitle">{props.contents[i].key}</h3>
              <p className="font-semibold text-white">{props.contents[i].value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
interface DivProps {
  children: React.ReactNode
  className?: string
}
export function ReliefCard({ children, className = "" }: DivProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg backdrop-blur-[60px] ${className}`}>
      {/* Gradient border effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          border: "1px solid transparent",
          background: "linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%) border-box",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {children}
    </div>
  )
}

export function GradientCard({ children, className = "" }: DivProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg backdrop-blur-[60px] ${className}`}>
      {/* Background gradients */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03)), radial-gradient(49.96% 50% at 50.04% 100%, #0075FF 0%, rgba(0, 0, 0, 0) 100%)",
        }}
      />

      {/* Border gradients */}
      <div
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          border: "1px solid transparent",
          background:
            "radial-gradient(49.97% 49.97% at 50.03% 100%, #FFFFFF 0%, #0075FF 19.71%, rgba(0, 0, 0, 0) 100%), linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%) border-box",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
export default function USGMarketList() {
  const { sUSGCurrentAPY } = useRootContext()

  const { lpUserPoints, voteUserPoints } = useUSGContext()

  const { displayRows, globalData, searchValue, setSearchValue, userData, sortMarketList, marketType, protocol, setMarketType, setProtocol } =
    useUSGMaketListContext()

  return (
    <>
      <div className="mb-4 flex items-stretch justify-between gap-6">
        <ReliefCard className="hidden w-1/2 xl:flex">
          <div className="flex overflow-hidden rounded-lg bg-panel-title-gradient">
            <div className="flex items-center justify-center">
              <Image height={140} width={140} src="/medias/tokens/USG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
            </div>
            <div className="flex flex-col items-start justify-center gap-3 px-6">
              <h2 className="text-4xl font-semibold">USG</h2>
              <p className="text-[15px]">
                Borrow USG against accepted LP tokens. Tangent features two kinds of markets.
                <Link href="/" className="inline-block cursor-pointer underline hover:text-white/40">
                  Learn more
                </Link>
              </p>
            </div>
          </div>
        </ReliefCard>

        <div className="hidden h-auto w-full flex-col items-center gap-2 xl:flex xl:w-1/2">
          <ReliefCard className="w-full">
            <div
              style={{ fontSize: "20px", lineHeight: "20px" }}
              className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+120px)_center] bg-no-repeat px-6 !font-semibold italic"
            >
              Points campaign
              <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
            </div>
          </ReliefCard>

          <ThreeCardRowWithMask
            contents={[
              { key: "Your Debt", value: `${formatNumber(Number(formatUnits(userData?.totalUserDebt || 0n, 18)), 0)} USG` },
              { key: "Your Collateral Deposits", value: `${formatNumber(Number(formatUnits(userData?.totalUserDeposit || 0n, 18)), 0)} USG` },
              { key: "Your Total Points", value: `${formatNumber(lpUserPoints?.lpTotalPoints + voteUserPoints?.voteTotalPoints, 0)} pts` },
            ]}
          ></ThreeCardRowWithMask>
        </div>
      </div>

      <Divider className="border-white/10!" />

      <div className="mt-4 flex w-full flex-col items-stretch justify-center gap-6 lg:flex-row">
        <div className="hidden w-full justify-center md:flex lg:w-1/2">
          <div className="flex h-full w-full items-stretch gap-4">
            <div className="basis-[40%]">
              <NeonLightCard className={cn(globalData.USGPrice === "-" ? "shimmer" : "", "h-full w-full")} color1="#0077ffa3" color2="#0075FF">
                <div className="flex h-full items-center gap-2 xl:gap-4">
                  <div className="flex-shrink-0">
                    <TokenImage token="USG" className="h-10 w-10" size={32} />
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-10 xl:gap-14">
                    {[
                      { key: "USG", value: formatDollar(globalData.USGPrice, 5) },
                      { key: "Supply", value: globalData.USGSupply },
                    ].map((item, index) => (
                      <div className="text-center" key={index}>
                        <div className="text-center text-xs text-subtitle">{item.key}</div>
                        <div className="text-center text-sm font-semibold">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </NeonLightCard>
            </div>
            <div className="basis-[60%]">
              <NeonLightCard className={cn(globalData.sUSGPrice === "-" ? "shimmer" : "", "h-full w-full")} color1="#95ff006d" color2="#95FF00">
                <div className="flex h-full items-center gap-5">
                  <div className="flex-shrink-0">
                    <TokenImage token="SUSG" className="h-10 w-10" size={32} />
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-10 xl:gap-14">
                    <div className="text-center">
                      <div className="text-xs text-subtitle">sUSG</div>
                      <div className="text-sm font-semibold">{globalData.sUSGPrice}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-subtitle">Supply</div>
                      <div className="text-sm font-semibold">{globalData.sUSGSupply}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-subtitle">APY</div>
                      <div className="text-sm font-semibold text-[#95FF00]">{sUSGCurrentAPY.toFixed(2) + "%"}</div>
                    </div>
                  </div>
                </div>
              </NeonLightCard>
            </div>
          </div>
        </div>

        <ReliefCard className={cn(globalData.globalCr === "-" ? "shimmer" : "", "flex items-center bg-white/[0.03] py-2 lg:w-1/2")}>
          <div className="flex w-1/3 flex-col items-center justify-center">
            <div className="whitespace-nowrap text-xs text-subtitle">Global CR</div>
            <div className="whitespace-nowrap text-sm font-semibold">{globalData.globalCr}</div>
          </div>

          {/* Séparateur */}
          <div className="h-10 w-px flex-shrink-0 bg-white/10" />

          <div className="flex w-1/3 flex-col items-center justify-center">
            <div className="whitespace-nowrap text-xs text-subtitle">Global TVL</div>
            <div className="whitespace-nowrap text-sm font-semibold">{globalData.globalTvl}</div>
          </div>

          {/* Séparateur */}
          <div className="h-10 w-px flex-shrink-0 bg-white/10" />

          <div className="flex w-1/3 flex-col items-center justify-center">
            <div className="whitespace-nowrap text-xs text-subtitle">Global Debt</div>
            <div className="whitespace-nowrap text-sm font-semibold">{globalData.globalDebt}</div>
          </div>
        </ReliefCard>
      </div>

      <div className="my-4 hidden items-end justify-between xl:flex">
        <div className="flex flex-col items-stretch justify-between gap-3">
          <div className="flex w-full items-end justify-start gap-2">
            <div className="flex w-full min-w-96 flex-col items-center justify-center">
              <div className="mb-1 text-xs text-subtitle"> Search </div>
              <InputSearch
                placeholder=""
                className="flex w-full flex-col items-center justify-center"
                value={searchValue ?? ""}
                onChange={(e) => setSearchValue(e as string)}
              />
            </div>

            <LargeButtonTab className="h-10 px-4" active={true} label="All"></LargeButtonTab>
            <LargeButtonTab className="h-10 px-4" active={false} label="Deposits"></LargeButtonTab>
          </div>
        </div>
        <div className="flex flex-col items-stretch justify-end gap-3">
          <div className="flex w-full items-stretch justify-center gap-2">
            <div className="flex w-full flex-col items-center justify-center md:w-fit">
              <div className="mb-1 text-xs text-subtitle"> Type </div>
              <InputSelect
                className="w-full min-w-48"
                template={MarketListSelectTemplate}
                value={marketType || ""}
                options={marketOptions}
                onChange={(e) => setMarketType(e)}
              />
            </div>

            <div className="flex w-full flex-col items-center justify-center md:w-fit">
              <div className="mb-1 text-xs text-subtitle"> Protocol </div>

              <InputSelect
                className="w-full min-w-48"
                template={MarketListSelectTemplate}
                value={protocol || ""}
                options={protocolOptions}
                onChange={(e) => setProtocol(e)}
              />
            </div>
          </div>
        </div>
      </div>

      <ListProvider customSort={sortMarketList} _headers={USGListHeaders} _rows={displayRows!} _listState={listeState}>
        <USGMarketListInner />
      </ListProvider>
    </>
  )
}

export function USGMarketListInner() {
  const { headers, listState, udpateSort } = useListContext()

  const { displayRows, marketData } = useUSGMaketListContext()

  return (
    <>
      <div className="mt-4 w-full rounded-t-[10px] bg-overlay-panel backdrop-blur-[60px]">
        <MarketListHeader rowDisposition={CustomMarketListRow} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      {displayRows?.map((item, index) => (
        <MarketListRow
          rowDisposition={CustomMarketListRow}
          className={cn("my-1", !!marketData.length && !!displayRows ? "" : "shimmer")}
          key={index}
          route={"/" + item.address + "/deposit-borrow"}
        >
          <ListAsset name={item.name} token={item.token} marketData={marketData.find((el) => el.marketAddress === item.address)} assetsEarned={[]} />

          <MarketListAPR
            rewardToken={item?.rewardToken}
            maxLeverage={1}
            currentAPRDetails={item.currentAPRDetails}
            projectedAPRDetails={item.projectedAPRDetails}
            apr={item.apr.current}
            projectedApr={item.apr.projected}
          />

          <MarketListAPR
            rewardToken={item?.rewardToken}
            maxLeverage={1 / (1 - item?.maxLTV) || 1}
            currentAPRDetails={item.currentAPRDetails}
            projectedAPRDetails={item.projectedAPRDetails}
            apr={item.apr.current}
            projectedApr={item.apr.projected}
          />

          <>
            {item.indicators.map((indicator, index) => (
              <Fragment key={indicator.key}>
                {indicator?.key === "borrowed" ? (
                  <div
                    key={indicator.key}
                    style={{ fontWeight: 300 }}
                    className={cn("hidden basis-[48%] flex-col items-center text-xl leading-5 md:flex-1 xl:block")}
                  >
                    <span className="flex flex-col items-center justify-center">
                      <span className={cn("flex text-sm text-subtitle md:text-xl xl:hidden")}>{indicator?.label}</span>
                      <span className="text-xs md:text-lg">{indicator?.value}</span>
                      <span className="hidden text-xs text-subtitle md:flex md:text-xs">/{formatNumber(indicator?.raw, 0)}</span>
                    </span>
                  </div>
                ) : (
                  <div
                    key={indicator.key}
                    style={{ fontWeight: 300 }}
                    className={cn(
                      "flex w-full basis-[48%] flex-col items-center justify-between text-xl leading-5 md:flex-1",
                      index >= 2 ? "hidden xl:block" : ""
                    )}
                  >
                    <span className="flex w-full items-center justify-between gap-2 xl:justify-center">
                      <span className={cn("flex text-sm text-subtitle xl:hidden xl:text-xl", indicator?.key === "tvl" ? "uppercase" : "")}>
                        {indicator?.label}
                      </span>
                      <span className="text-sm xl:text-lg">{indicator?.value}</span>
                    </span>
                  </div>
                )}
              </Fragment>
            ))}

            {item.userHasDeposited && (
              <div className="absolute -right-4 top-0 flex h-full w-2 items-center justify-center">
                <div className="h-10 w-2 rounded-full bg-tonic"></div>
              </div>
            )}
          </>
        </MarketListRow>
      ))}
    </>
  )
}
