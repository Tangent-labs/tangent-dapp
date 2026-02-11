"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { ExistingAsset } from "@/types"
import { useUSGStakeContext } from "./usg_stake_context"
import { computeProjection } from "./usg_stake_controller"
import Divider from "@/components/design_system/structure/divider"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import { useRootContext } from "@/components/products/root/root_context"
import PerformanceHistoryPanel from "./components/PerformanceHistoryPanel"
import BorderPanel from "@/components/design_system/structure/border_panel"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import LargeButtonTab from "@/components/design_system/inputs/large_button_tab"
import { formatBigInt, formatDollar, formatNumber } from "@/lib/number_formatter"
import { DepositReceiveInput } from "@/components/design_system/inputs/deposit_receive_input"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import PointsCampaignLiveCard from "@/components/design_system/structure/points_campaign_live_card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function USGStakeContent() {
  const color1 = "#0077ff67"
  const color2 = "#0075FF"

  const {
    actionStake,
    actionUnstake,
    setCurrentFeature,
    actionApprove,
    setStakePercentage,
    setWeiValue,
    fetchsUSGHistoryAPY,
    currentFeature,
    currentAssetInfo,
    weiValue,
    expected,
    receivedTokenInfo,
    formState,
    computeProjectedValue,
    stakePercentage,
    USGsUSGMetrics,
    sUSGSelectedTab,
    apyHistory,
    aprVariation,
  } = useUSGStakeContext()

  const { sUSGCurrentAPY } = useRootContext()

  const { connect } = useWalletConnexionContext()

  const DepositAssetDisplay = () => {
    if (!receivedTokenInfo) return <></>

    return (
      <BorderPanel className="flex w-20 items-center justify-between gap-2 bg-select-input p-2">
        <TokenImage token={currentAssetInfo?.asset?.logo as ExistingAsset} size={20} />
        <span className="text-sm font-semibold">
          <span>{currentAssetInfo?.asset?.symbol}</span>
        </span>
      </BorderPanel>
    )
  }

  const ReceiveAssetDisplay = () => {
    if (!receivedTokenInfo) return <></>

    return (
      <BorderPanel className="flex w-20 items-center justify-between gap-2 bg-select-input p-2">
        <TokenImage token={receivedTokenInfo.logo as ExistingAsset} size={20} />
        <span className="text-sm font-semibold">
          <span>{receivedTokenInfo.symbol}</span>
        </span>
      </BorderPanel>
    )
  }

  return (
    <>
      <div className="flex items-stretch justify-between gap-6">
        <ReliefCard className="hidden w-1/2 rounded-[10px] bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={140} width={140} src="/medias/tokens/SUSG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Savings account</span>
            <p className="text-[15px]">
              Stake USG to receive sUSG and earn yield passively. sUSG is an ERC4626 token and can be used further in DeFi. Learn more
            </p>
          </div>
        </ReliefCard>

        <div className="flex h-auto w-full flex-col items-center gap-2 xl:w-1/2">
          <PointsCampaignLiveCard></PointsCampaignLiveCard>

          <div
            className={cn(
              "relative flex w-full items-center justify-between gap-3 rounded-[10px] bg-overlay-panel px-6 py-3",
              !!USGsUSGMetrics ? "" : "shimmer"
            )}
          >
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url("./medias/card_bg_blocks.png")' }} />

            <div
              className="absolute inset-0"
              style={{
                left: 0,
                width: "100%",
                background: `
                  linear-gradient(0deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03)), 
                  radial-gradient(50.04% 50% at 50% 100%, ${color1} 0%, rgba(0, 0, 0, 0) 100%)
                `,
              }}
            />

            <div
              className="pointer-events-none absolute inset-0 rounded-lg"
              style={{
                padding: "1px",
                left: 0,
                width: "100%",
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

            <TokenImage className="relative hidden lg:flex" token="sUSG" size={48} />

            <div className="relative flex flex-col items-center justify-center font-semibold">
              <span className="text-sm text-subtitle">Supply</span>
              <span className="text-lg font-semibold">{formatNumber(Number(formatUnits(USGsUSGMetrics?.sUSGSupply || 0n, 18)), 0)} </span>
            </div>
            <div className="relative flex flex-col items-center justify-center font-semibold">
              <span className="text-sm text-subtitle">sUSG</span>
              <span className="text-lg font-semibold">{formatDollar(formatUnits(USGsUSGMetrics?.sUSGPrice || 0n, 18), 2)}</span>
            </div>
            <div className="relative flex flex-col items-center justify-center rounded-[10px] bg-button-active bg-opacity-100 px-8 py-1">
              <span className="text-sm font-semibold text-black">APY</span>
              <span className="text-lg font-semibold">{sUSGCurrentAPY.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex w-full flex-col gap-2 lg:flex-row lg:items-start lg:gap-4">
        <ReliefCard className="flex w-full flex-col items-center justify-start gap-1 rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px] lg:w-5/12 xl:w-1/3">
          <div className="flex w-full items-center justify-between gap-4">
            <LargeButtonTab
              onClick={() => setCurrentFeature("stake")}
              active={currentFeature === "stake"}
              className="flex w-full justify-center"
              label="Stake"
            ></LargeButtonTab>
            <LargeButtonTab
              onClick={() => setCurrentFeature("unstake")}
              active={currentFeature === "unstake"}
              className="flex w-full justify-center"
              label="Unstake"
            ></LargeButtonTab>
          </div>

          <Divider className="h-1 w-full"></Divider>

          <div className="flex w-full items-end justify-end">
            <span className="text-xs text-subtitle">
              Max: {formatBigInt(currentAssetInfo?.balance, 18, 2)} {currentFeature === "stake" ? "USG" : "sUSG"}{" "}
            </span>
          </div>

          <DepositReceiveInput
            labelDeposit={currentFeature === "stake" ? "You deposit" : "You unstake"}
            labelReceive={currentFeature === "stake" ? "You stake" : "You receive"}
            className="w-full"
            depositAmount={weiValue}
            depositSelect={<DepositAssetDisplay />}
            disabled={false}
            receiveAssetDisplay={<ReceiveAssetDisplay />}
            depositAsset={currentAssetInfo?.asset}
            receiveDollarValue={(Number(formatUnits(expected || 0n, 18)) * Number(formatUnits(USGsUSGMetrics?.sUSGPrice || 0n, 18)))?.toFixed(2)}
            balance={currentAssetInfo?.balance}
            receiveAmount={Number(formatUnits(expected || 0n, 18)).toFixed(0)}
            setMaxBalance={() => {
              setStakePercentage(100)
              setWeiValue(currentAssetInfo?.balance)
            }}
            onValueChange={(value: bigint | undefined) => setWeiValue(value)}
            percentage={stakePercentage}
            setPercentage={setStakePercentage}
            onClickChevron={() => setCurrentFeature(currentFeature === "stake" ? "unstake" : "stake")}
          />

          <Accordion className="w-full" type="single" collapsible>
            <AccordionItem value="item-1">
              <BorderPanel className="my-2 flex cursor-pointer flex-col bg-white bg-opacity-[3%] px-2 text-xs text-primary backdrop-blur-[60px]">
                <AccordionTrigger>
                  <span className="py-1.5">Recap</span>
                </AccordionTrigger>

                <AccordionContent className="w-full">
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex w-full items-center justify-between">
                      <span className="text-subtitle">APR variation : </span>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-white">{aprVariation.current}</span>
                        <span className="text-tonic">{aprVariation.updated}</span>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-between">
                      <span className="text-subtitle">Expected : </span>

                      <span className="font-semibold text-white">
                        {formatBigInt(expected, 18, 2)} {currentFeature === "stake" ? "sUSG" : "USG"}
                      </span>
                    </div>
                  </div>
                </AccordionContent>
              </BorderPanel>
            </AccordionItem>
          </Accordion>

          <FormButtons
            actions={{
              handleApprove: currentFeature === "stake" ? actionApprove : undefined,
              handleProcess: currentFeature === "stake" ? actionStake : actionUnstake,
            }}
            connect={connect}
            formState={formState}
            labelProcess={currentFeature === "stake" ? "Deposit & Stake" : "Unstake"}
          />
        </ReliefCard>

        <div className="flex w-full flex-col lg:hidden">
          {!!USGsUSGMetrics && !!sUSGCurrentAPY && sUSGCurrentAPY > 0 && (
            <div className="mt-6 flex w-full flex-col items-end justify-between gap-2 self-end sm:flex-row">
              <EvolutionBox
                className="w-full"
                originalValue={formatNumber(Number(formatUnits(USGsUSGMetrics?.sUSGBalance ?? 0n, 18)), 0)}
                label="sUSG balance"
                newValue={formatNumber(computeProjectedValue, 0)}
              />

              <EvolutionBox
                className="w-full"
                originalValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1 / 12, sUSGCurrentAPY, currentFeature)}
                label="30 days projection"
                newValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1 / 12, sUSGCurrentAPY, currentFeature, weiValue)}
                logo="sUSG"
              />

              <EvolutionBox
                className="w-full"
                originalValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1, sUSGCurrentAPY, currentFeature)}
                label="1 year projection"
                newValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1, sUSGCurrentAPY, currentFeature, weiValue)}
                logo="sUSG"
              />
            </div>
          )}
        </div>

        <PerformanceHistoryPanel
          currentFeature={currentFeature}
          USGsUSGMetrics={USGsUSGMetrics!}
          computeProjection={computeProjection}
          weiValue={weiValue || 0n}
          computeProjectedValue={computeProjectedValue}
          sUSGSelectedTab={sUSGSelectedTab}
          fetchsUSGHistoryAPY={fetchsUSGHistoryAPY}
          apyHistory={apyHistory}
          sUSGCurrentAPY={sUSGCurrentAPY}
        ></PerformanceHistoryPanel>
      </div>
    </>
  )
}
