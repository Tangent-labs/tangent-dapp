"use client"

import IndicatorCards from "@/components/design_system/structure/indicators_card"
import { useTgUsdClaimContext } from "./tg_usd_claim_context"
import ListAsset from "@/components/design_system/list/list_asset"
import { formatDollar } from "@/lib/number_formatter"
import ListIndicator from "@/components/design_system/list/list_indicator"
import Panel from "@/components/design_system/structure/panel"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import TokenImage from "@/components/design_system/structure/token_image"
import { ClaimableMarket } from "../tg_usd_type"
import Divider from "@/components/design_system/structure/divider"
import { Button } from "@/components/design_system/inputs/button"
import HelpPropover from "@/components/design_system/structure/help_popover"

export default function TgUsdClaimContent() {
  const [marketsToClaim, setMarketsToClaim] = useState<ClaimableMarket[]>([])

  const { displayRows, actionClaim } = useTgUsdClaimContext()

  const addToClaimableMarkets = (rowData: ClaimableMarket) => {
    setMarketsToClaim((prevMarkets: ClaimableMarket[]) => {
      const market = prevMarkets.find((market) => market.marketName === rowData.marketName)

      if (market) {
        return prevMarkets.filter((m) => m.marketName !== market.marketName)
      } else {
        return [...prevMarkets, { marketName: rowData.marketName, claimable: rowData.claimable, marketAddress: rowData.marketAddress }]
      }
    })
  }

  const onClickClaim = () => {
    //
    // fetch dynamically
    const rewardAccumulatorContractAddress = "0xDC0a0B1Cd093d321bD1044B5e0Acb71b525ABb6b"

    const marketAddressesToClaim = marketsToClaim.map((el) => el.marketAddress)
    actionClaim(rewardAccumulatorContractAddress, marketAddressesToClaim)
  }

  return (
    <>
      <div className="mt-10 flex items-center justify-between">
        <IndicatorCards
          indicators={[
            { title: "Total deposited", value: "$300,000" },
            { title: "Total claimable", value: "$100,000" },
          ]}
        />
      </div>

      <div className="flex w-full items-start justify-start gap-4">
        <div className="flex w-9/12 flex-col">
          {displayRows?.map((item) => (
            <Panel
              key={item.marketName}
              onClick={
                Number(item?.totalClaimableValue) > 0
                  ? () =>
                      addToClaimableMarkets({
                        marketName: item.marketName,
                        claimable: item.totalClaimableValue,
                        marketAddress: item.marketAddress,
                      })
                  : () => {}
              }
              className={`mb-2 flex w-full items-center justify-center border p-5 before:absolute before:inset-0 before:-z-10 before:rounded-[10px] before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover`}
            >
              <div className={`flex min-w-[320px] items-center gap-4`}>
                <ListAsset name={item.marketName} token={item.marketName} assetsEarned={[]} />
              </div>

              <div className={`flex min-w-24 flex-col text-center`}>
                <span className="text-[20px] leading-4">vAPR</span>

                <span className="whitespace-nowrap font-bold text-row-tonic">10%</span>
              </div>

              <div className="flex items-center gap-4">
                <ListIndicator info="Claimable" value={formatDollar(item?.totalClaimableValue || 0)} valueFirst={false} />

                {/* change from click to hover */}
                <HelpPropover title="Rewards Breakdown">
                  <div className="flex flex-col gap-1 text-sm">
                    {item?.claimable?.map((reward, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-10">
                          <TokenImage token={reward.symbol} size={16} />
                        </div>
                        <span className="w-20"> {reward.symbol}</span>
                        <span className=""> {formatDollar(reward?.valueInUsd)}</span>
                      </div>
                    ))}
                  </div>
                </HelpPropover>
              </div>

              <ListIndicator info="Deposited" value={formatDollar(item?.totalDepositedValue || 0)} valueFirst={false} />
              <Switch />
            </Panel>
          ))}
        </div>

        <div className="flex h-full min-h-52 w-3/12 flex-col items-start justify-start rounded-xl border border-white p-5">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col items-start justify-start">Market</div>

            <div className="flex flex-col items-start justify-start">Claimable</div>
          </div>

          <Divider className="h-0.5 w-full bg-white/10" />

          <div className="flex w-full flex-col">
            {marketsToClaim.map((el: ClaimableMarket) => (
              <div key={el.marketName} className="flex w-full items-center justify-between">
                <div className={`relative flex items-center gap-4`}>
                  <TokenImage token={el.marketName} size={16} className="w-8" />
                  <span className="text-[12px] font-semibold">{el.marketName}</span>
                </div>

                <span className="text-[12px] font-semibold">{el.claimable}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex w-full">
            {marketsToClaim.length > 0 && <Button label="CLAIM" className="flex w-full items-center justify-center" onClick={() => onClickClaim()} />}
          </div>
        </div>
      </div>
    </>
  )
}
