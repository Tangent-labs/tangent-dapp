"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { formatUnits } from "viem"
import { ExistingAsset } from "@/types"
import { useRootContext } from "../../root/root_context"
import { useUSGStakeContext } from "./tg_usd_stake_context"
import { computeProjection } from "./tg_usd_stake_controller"
import Divider from "@/components/design_system/structure/divider"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import PerformanceHistoryPanel from "./components/PerformanceHistoryPanel"
import BorderPanel from "@/components/design_system/structure/border_panel"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { formatBigInt, formatDollar, formatNumber } from "@/lib/number_formatter"
import { DepositReceiveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

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
        <div className="hidden w-1/2 rounded-[10px] bg-panel-title-gradient xl:flex">
          <div className="flex items-center justify-center">
            <Image height={140} width={140} src="/medias/tokens/SUSG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          </div>
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Savings account</span>
            <p className="text-[15px]">
              Stake USG to receive sUSG and earn yield passively. sUSG is an ERC4626 token and can be used further in DeFi. Learn more
            </p>
          </div>
        </div>

        <div className="flex h-auto w-full flex-col items-center gap-3 xl:w-1/2">
          <div
            style={{ fontSize: "20px", lineHeight: "20px" }}
            className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+120px)_center] bg-no-repeat px-6 !font-semibold italic"
          >
            Points campaign
            <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
          </div>

          <div className={cn("flex w-full items-center justify-between gap-3 rounded-[10px] bg-overlay-panel p-2", !!USGsUSGMetrics ? "" : "shimmer")}>
            <TokenImage className="hidden lg:flex" token="sUSG" size={48} />

            <div className="flex flex-col items-center justify-center font-semibold">
              <span className="text-sm text-subtitle">Supply</span>
              <span className="text-lg font-semibold">{formatNumber(Number(formatUnits(USGsUSGMetrics?.sUSGSupply || 0n, 18)), 0)} </span>
            </div>
            <div className="flex flex-col items-center justify-center font-semibold">
              <span className="text-sm text-subtitle">sUSG</span>
              <span className="text-lg font-semibold">{formatDollar(formatUnits(USGsUSGMetrics?.sUSGPrice || 0n, 18), 2)}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-button-active px-8 py-1">
              <span className="text-black">APY</span>
              <span className="text-lg font-semibold">{sUSGCurrentAPY.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex w-full flex-col gap-2 lg:flex-row lg:gap-4">
        <div className="flex w-full flex-col items-center justify-center gap-1 rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px] lg:w-5/12 xl:w-1/3">
          <div className="flex w-full items-center justify-between gap-4">
            <ButtonTab
              onClick={() => setCurrentFeature("stake")}
              active={currentFeature === "stake"}
              className="flex w-full justify-center"
              label="Stake"
            ></ButtonTab>
            <ButtonTab
              onClick={() => setCurrentFeature("unstake")}
              active={currentFeature === "unstake"}
              className="flex w-full justify-center"
              label="Unstake"
            ></ButtonTab>
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
            setMaxBalance={() => setWeiValue(currentAssetInfo?.balance)}
            onValueChange={(value: bigint | undefined) => setWeiValue(value)}
            percentage={stakePercentage}
            setPercentage={setStakePercentage}
          />

          <div className="mb-4 mt-2 flex w-full flex-col gap-2">
            <span className="w-full text-sm font-semibold lg:text-xl">Recap:</span>

            <div className="flex w-full flex-col gap-1 rounded-[10px] bg-overlay-panel p-2 text-xs">
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
          </div>

          <FormButtons
            actions={{
              handleApprove: currentFeature === "stake" ? actionApprove : undefined,
              handleProcess: currentFeature === "stake" ? actionStake : actionUnstake,
            }}
            connect={connect}
            formState={formState}
            labelProcess={currentFeature === "stake" ? "Deposit & Stake" : "Unstake"}
          />
        </div>

        <div className="flex w-full flex-col lg:hidden">
          {!!sUSGCurrentAPY && sUSGCurrentAPY > 0 && (
            <div className="mt-6 flex w-full flex-col items-end justify-between gap-2 self-end sm:flex-row">
              <EvolutionBox
                className="w-full"
                originalValue={formatNumber(Number(formatUnits(USGsUSGMetrics?.sUSGBalance ?? 0n, 18)), 0)}
                label="sUSG balance"
                newValue={formatNumber(computeProjectedValue, 0)}
              />

              <EvolutionBox
                className="w-full"
                originalValue={computeProjection(USGsUSGMetrics!, 1 / 12, sUSGCurrentAPY, currentFeature)}
                label="30 days projection"
                newValue={computeProjection(USGsUSGMetrics!, 1 / 12, sUSGCurrentAPY, currentFeature, weiValue)}
              />

              <EvolutionBox
                className="w-full"
                originalValue={computeProjection(USGsUSGMetrics!, 1, sUSGCurrentAPY, currentFeature)}
                label="1 year projection"
                newValue={computeProjection(USGsUSGMetrics!, 1, sUSGCurrentAPY, currentFeature, weiValue)}
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
