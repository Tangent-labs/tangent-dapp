"use client"

import Link from "next/link"
import Image from "next/image"
import { formatUnits } from "viem"
import { useUSGStakeContext } from "./usg_stake_context"
import { computeProjection } from "./usg_stake_controller"
import { IconChevron, IconOpenOutside } from "@/components/icons"
import { Divider } from "@/components/design_system/structure/divider"
import FormButtons from "@/components/design_system/form/form_actions"
import { useRootContext } from "@/components/products/root/root_context"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { PageHeader } from "@/components/design_system/structure/page_header"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { EvolutionBox } from "@/components/design_system/structure/evolution_box"
import { PositionPerformancePanel } from "./components/position_performance_panel"
import { LargeButtonTab } from "@/components/design_system/inputs/large_button_tab"
import { StaticCardAssetInput } from "../../predeposit/components/StaticCardAssetInput"
import { formatBigInt, formatDollar, formatMillions, formatNumber } from "@/lib/number_formatter"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { FeatureBannerCarousel } from "@/components/design_system/structure/feature_banner_carousel"
import { ThreeCardRowWithMask } from "@/components/design_system/structure/three_cards_with_background_and_neon"

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
    isLoading,
  } = useUSGStakeContext()

  const { sUSGCurrentAPY } = useRootContext()

  const { connect } = useWalletConnexionContext()

  const isStake = "stake" === currentFeature
  let inputInAsset = ""
  let inputOutAsset = ""

  if (isStake) {
    inputInAsset = "USG"
    inputOutAsset = "sUSG"
  } else {
    inputInAsset = "sUSG"
    inputOutAsset = "USG"
  }

  return (
    <>
      <div className="flex items-stretch justify-between gap-5">
        <PageHeader>
          <Image height={150} width={150} src="/medias/tokens/SUSG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

          <div className="flex flex-col items-start justify-center px-6">
            <span className="text-4xl font-semibold">Savings account</span>
            <p className="mt-2 text-[15px]">Stake USG to receive sUSG and earn yield passively. sUSG is an ERC4626 token and can be used further in DeFi.</p>
            <Link
              className="flex cursor-pointer items-center justify-center underline hover:text-white/30"
              href="https://docs.tangent.finance/docs/usg/overview_usg#savings-account%E2%80%8B"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about sUSG <IconOpenOutside className="ml-1 mt-1 flex w-4 fill-white" />
            </Link>
          </div>
        </PageHeader>

        <div className="flex h-auto w-full flex-col justify-between gap-[10px] xl:w-1/2">
          <FeatureBannerCarousel />

          <ThreeCardRowWithMask
            contents={[
              { key: "Supply", value: formatMillions(Number(formatUnits(USGsUSGMetrics?.sUSGSupply || 0n, 18))) },
              { key: "sUSG price", value: formatDollar(formatUnits(USGsUSGMetrics?.sUSGPrice || 0n, 18), 4) },
              { key: "sUSG APY", value: sUSGCurrentAPY.toFixed(2) + "%" },
            ]}
          />
        </div>
      </div>

      <div className="mt-5 flex w-full flex-col gap-2 lg:flex-row lg:items-start lg:gap-5">
        <ReliefCard className="flex w-full flex-col items-center justify-start gap-1 p-5 lg:w-5/12 xl:w-1/3">
          <div className="flex w-full items-center justify-between gap-4">
            <LargeButtonTab
              onClick={() => setCurrentFeature("stake")}
              active={currentFeature === "stake"}
              className="flex w-full justify-center"
              label="Stake"
            />
            <LargeButtonTab
              onClick={() => setCurrentFeature("unstake")}
              active={currentFeature === "unstake"}
              className="flex w-full justify-center"
              label="Unstake"
            />
          </div>

          <Divider className="w-full" />

          <div className="mb-[5px] flex w-full items-center justify-between">
            <span className="text-sm font-semibold md:text-xl">Deposit</span>
            <span className="text-xs text-subtitle">
              Max: {formatBigInt(currentAssetInfo?.balance, 18, 2)} {currentFeature === "stake" ? "USG" : "sUSG"}{" "}
            </span>
          </div>
          <div className="mb-[5px] w-full">
            <GenericInputAssetAmount
              inputWeiValue={weiValue}
              onValueChange={(value: bigint | undefined) => setWeiValue(value)}
              depositSelect={<StaticCardAssetInput assetName={inputInAsset} logoKey={inputInAsset} />}
              asset={currentAssetInfo?.asset}
              label={isStake ? "You deposit" : "You unstake"}
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

            <div className="my-[10px] flex w-full items-center justify-center">
              <ReliefCard
                onClick={() => setCurrentFeature(isStake ? "unstake" : "stake")}
                className="flex h-9 w-9 cursor-pointer items-center justify-center border-none hover:bg-white/10"
              >
                <IconChevron className="h-auto w-8 rounded-[10px] stroke-white p-2 text-white" />
              </ReliefCard>
            </div>

            <GenericInputAssetAmount
              inputWeiValue={expected}
              onValueChange={(value: bigint | undefined) => setWeiValue(value)}
              depositSelect={<StaticCardAssetInput assetName={inputOutAsset} logoKey={inputOutAsset} />}
              asset={receivedTokenInfo}
              label={isStake ? "You receive" : "You receive"}
              disabled={true}
            />
          </div>

          {formState.errors
            .filter((e) => e.type === "form-alert")
            .map((error) => (
              <FormAlert key={error.key} error={error} className="my-1" isLoading={isLoading} />
            ))}

          <FormButtons
            actions={{
              handleApprove: isStake ? actionApprove : undefined,
              handleProcess: isStake ? actionStake : actionUnstake,
            }}
            connect={connect}
            formState={formState}
            isLoading={isLoading}
            labelProcess={isStake ? "Stake" : "Unstake"}
          />
        </ReliefCard>

        <div className="flex w-full flex-col lg:hidden">
          {!!USGsUSGMetrics && !!sUSGCurrentAPY && sUSGCurrentAPY > 0 && (
            <div className="mt-5 flex w-full flex-col items-end justify-between gap-2 self-end sm:flex-row">
              <EvolutionBox
                className="w-full"
                originalValue={formatNumber(Number(formatUnits(USGsUSGMetrics?.sUSGBalance ?? 0n, 18)), 0)}
                label="sUSG balance"
                newValue={formatNumber(computeProjectedValue >= 0 ? computeProjectedValue : 0, 0)}
              />

              <EvolutionBox
                className="w-full"
                originalValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1 / 12, sUSGCurrentAPY, currentFeature)}
                label="30 days projection"
                newValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1 / 12, sUSGCurrentAPY, currentFeature, weiValue)}
                logo="USG"
              />

              <EvolutionBox
                className="w-full"
                originalValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1, sUSGCurrentAPY, currentFeature)}
                label="1 year projection"
                newValue={computeProjection(USGsUSGMetrics?.sUSGBalance, 1, sUSGCurrentAPY, currentFeature, weiValue)}
                logo="USG"
              />
            </div>
          )}
        </div>

        <PositionPerformancePanel
          currentFeature={currentFeature}
          USGsUSGMetrics={USGsUSGMetrics!}
          computeProjection={computeProjection}
          weiValue={weiValue || 0n}
          computeProjectedValue={computeProjectedValue}
          sUSGSelectedTab={sUSGSelectedTab}
          fetchsUSGHistoryAPY={fetchsUSGHistoryAPY}
          apyHistory={apyHistory}
          sUSGCurrentAPY={sUSGCurrentAPY}
        />
      </div>
    </>
  )
}
