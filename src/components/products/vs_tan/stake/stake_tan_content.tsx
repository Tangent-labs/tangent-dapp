"use client"

import { formatUnits } from "viem"
import { useStakeTanContext } from "./stake_tan_context"
import { computeProjection } from "./stake_tan_controller"
import { TanPositionPerformancePanel } from "./components/position_performance_panel"
import { IconChevron } from "@/components/icons"
import { Divider } from "@/components/design_system/structure/divider"
import FormButtons from "@/components/design_system/form/form_actions"
import { useRootContext } from "@/components/products/root/root_context"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { EvolutionBox } from "@/components/design_system/structure/evolution_box"
import { LargeButtonTab } from "@/components/design_system/inputs/large_button_tab"
import { StaticCardAssetInput } from "../../predeposit/components/StaticCardAssetInput"
import { formatBigInt, formatNumber } from "@/lib/number_formatter"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StakeTanContent() {
  const {
    actionStake,
    actionUnstake,
    setCurrentFeature,
    actionApprove,
    setStakePercentage,
    setWeiValue,
    currentFeature,
    currentAssetInfo,
    weiValue,
    expected,
    receivedTokenInfo,
    formState,
    computeProjectedValue,
    stakePercentage,
    TANsTANMetrics,
    sTanSelectedTab,
    apyHistory,
    fetchsTanHistoryAPY,
    isLoading,
  } = useStakeTanContext()

  const { sTanCurrentAPY } = useRootContext()

  const { connect } = useWalletConnexionContext()

  const isStake = "stake" === currentFeature

  const inputInAsset = isStake ? "TAN" : "sTAN"
  const inputOutAsset = isStake ? "sTAN" : "TAN"

  const router = useRouter()

  useEffect(() => {
    router.push("/tan/lock")
  }, [])

  return (
    <>
      <div className="mt-4 flex w-full flex-col gap-2 lg:flex-row lg:items-start lg:gap-5">
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
              Max: {formatBigInt(currentAssetInfo?.balance, 18, 2)} {isStake ? "TAN" : "sTAN"}{" "}
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
              label="You receive"
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
          {!!TANsTANMetrics && sTanCurrentAPY > 0 && (
            <div className="mt-5 flex w-full flex-col items-end justify-between gap-2 self-end sm:flex-row">
              <EvolutionBox
                className="w-full"
                originalValue={formatNumber(Number(formatUnits(TANsTANMetrics?.sTanBalance ?? 0n, 18)), 0)}
                label="sTAN balance"
                newValue={formatNumber(computeProjectedValue >= 0 ? computeProjectedValue : 0, 0)}
              />

              <EvolutionBox
                className="w-full"
                originalValue={computeProjection(TANsTANMetrics?.sTanBalance ?? 0n, 1 / 12, sTanCurrentAPY, currentFeature)}
                label="30 days projection"
                newValue={computeProjection(TANsTANMetrics?.sTanBalance ?? 0n, 1 / 12, sTanCurrentAPY, currentFeature, weiValue)}
                logo="TAN"
              />

              <EvolutionBox
                className="w-full"
                originalValue={computeProjection(TANsTANMetrics?.sTanBalance ?? 0n, 1, sTanCurrentAPY, currentFeature)}
                label="1 year projection"
                newValue={computeProjection(TANsTANMetrics?.sTanBalance ?? 0n, 1, sTanCurrentAPY, currentFeature, weiValue)}
                logo="TAN"
              />
            </div>
          )}
        </div>

        <TanPositionPerformancePanel
          currentFeature={currentFeature}
          sTanBalance={TANsTANMetrics?.sTanBalance ?? 0n}
          computeProjectedValue={computeProjectedValue}
          weiValue={weiValue || 0n}
          sTanSelectedTab={sTanSelectedTab}
          fetchsTanHistoryAPY={fetchsTanHistoryAPY}
          apyHistory={apyHistory}
          sTanCurrentAPY={sTanCurrentAPY}
        />
      </div>
    </>
  )
}
