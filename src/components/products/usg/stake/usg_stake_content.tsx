"use client"

import Link from "next/link"
import Image from "next/image"
import { formatUnits } from "viem"
import { IconChevron } from "@/components/icons"
import { useUSGStakeContext } from "./usg_stake_context"
import { IconStars } from "@/components/icons/icon_stars"
import { computeProjection } from "./usg_stake_controller"
import { Divider } from "@/components/design_system/structure/divider"
import { useRootContext } from "@/components/products/root/root_context"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { PerformanceHistoryPanel } from "./components/PerformanceHistoryPanel"
import { formatBigInt, formatDollar, formatNumber } from "@/lib/number_formatter"
import { EvolutionBox } from "@/components/design_system/structure/evolution_box"
import { LargeButtonTab } from "@/components/design_system/inputs/large_button_tab"
import { StaticCardAssetInput } from "../../predeposit/components/StaticCardAssetInput"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { PointsCampaignLiveCard } from "@/components/design_system/structure/points_campaign_live_card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ThreeCardRowWithMask } from "@/components/design_system/structure/three_cards_with_background_and_neon"
import FormButtons from "@/components/design_system/form/form_actions"

export default function USGStakeContent() {
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

  return (
    <>
      <div className="flex items-stretch justify-between gap-6">
        <ReliefCard className="hidden w-1/2 bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={150} width={150} src="/medias/tokens/SUSG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Savings account</span>
            <p className="text-[15px]">
              Stake USG to receive sUSG and earn yield passively. sUSG is an ERC4626 token and can be used further in DeFi.
              <Link
                className="ml-1 inline-block cursor-pointer underline hover:text-white/40"
                href="https://docs.tangent.finance/docs/usg/susg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about sUSG.
              </Link>
            </p>
          </div>
        </ReliefCard>

        <div className="flex h-auto w-full flex-col justify-between gap-2 xl:w-1/2">
          <PointsCampaignLiveCard></PointsCampaignLiveCard>

          <ThreeCardRowWithMask
            contents={[
              { key: "Supply", value: formatNumber(Number(formatUnits(USGsUSGMetrics?.sUSGSupply || 0n, 18)), 0) },
              { key: "sUSG", value: formatDollar(formatUnits(USGsUSGMetrics?.sUSGPrice || 0n, 18), 2) },
              {
                key: "APY",
                value: (
                  <div className="flex items-center justify-center gap-1">
                    {sUSGCurrentAPY.toFixed(2)}%<IconStars className="w-4 fill-row-tonic"></IconStars>
                  </div>
                ),
              },
            ]}
          ></ThreeCardRowWithMask>
        </div>
      </div>

      <div className="mt-4 flex w-full flex-col gap-2 lg:flex-row lg:items-start lg:gap-4">
        <ReliefCard className="flex w-full flex-col items-center justify-start gap-1 p-4 lg:w-5/12 xl:w-1/3">
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
          <div className="w-full">
            <GenericInputAssetAmount
              inputWeiValue={weiValue}
              onValueChange={(value: bigint | undefined) => setWeiValue(value)}
              depositSelect={<StaticCardAssetInput asset={"stake" === currentFeature ? "USG" : "sUSG"} />}
              asset={currentAssetInfo?.asset}
              label={currentFeature === "stake" ? "You deposit" : "You unstake"}
              maxAmountParams={{
                maxWeiValue: currentAssetInfo?.balance || 0n,
                setMaxAmount: () => {
                  setStakePercentage(100)
                  setWeiValue(currentAssetInfo?.balance)
                },
              }}
              sliderParams={{
                sliderPercentage: stakePercentage,
                setSliderPercentage: setStakePercentage,
              }}
            />

            <div
              onClick={() => setCurrentFeature(currentFeature === "stake" ? "unstake" : "stake")}
              className="my-2 flex w-full cursor-pointer items-center justify-center border-none"
            >
              <IconChevron className="h-auto w-8 rounded-[10px] border border-white border-white/10 border-opacity-20 bg-select-input stroke-white p-2 text-white backdrop-blur-[60px] hover:bg-white/10" />
            </div>

            <GenericInputAssetAmount
              inputWeiValue={expected}
              onValueChange={(value: bigint | undefined) => setWeiValue(value)}
              depositSelect={<StaticCardAssetInput asset={"stake" === currentFeature ? "sUSG" : "USG"} />}
              asset={receivedTokenInfo}
              label={currentFeature === "stake" ? "You stake" : "You receive"}
              disabled={true}
            />
          </div>

          <Accordion className="w-full" type="single" collapsible>
            <AccordionItem value="item-1">
              <ReliefCard className="flex cursor-pointer flex-col px-2 text-xs text-primary">
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
              </ReliefCard>
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
