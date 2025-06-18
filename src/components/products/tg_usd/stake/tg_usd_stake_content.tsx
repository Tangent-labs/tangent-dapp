"use client"

import Image from "next/image"
import { useTgUsdStakeContext } from "./tg_usd_stake_context"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import { DepositReceiveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import InputSelect from "@/components/design_system/inputs/input_select"
import { ExistingAsset, SelectOption } from "@/types"
import TokenImage from "@/components/design_system/structure/token_image"
import { TGUSD_CONTRACT } from "../tg_usd_repository"
import { ForecastGraph } from "./tg_usd_staking_forecast"
import Divider from "@/components/design_system/structure/divider"
import { computeProjection } from "./tg_usd_stake_controller"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import FormButtons from "@/components/design_system/form/form_actions"

export default function TgUsdStakeContent() {
  const {
    actionStake,
    actionUnstake,
    setCurrentFeature,
    actionApprove,
    setWeiValue,
    stakeInfo,
    currentFeature,
    depositAssetOptions,
    currentAssetInfo,
    weiValue,
    expected,
    receivedTokenInfo,
    formState,
    computeProjectedValue,
    stakePercentage,
    setStakePercentage,
  } = useTgUsdStakeContext()

  const AssetSelect = () => {
    return <InputSelect className="w-full" template={AssetSelectTemplate} value={currentAssetInfo?.current} options={depositAssetOptions} onChange={() => {}} />
  }

  const AssetSelectTemplate = (option: SelectOption) => {
    const assetInfo = {
      address: TGUSD_CONTRACT.TG_USD,
      decimals: 18,
      displayDecimals: 2,
      logo: "USG",
      name: "USG",
      price: stakeInfo?.tgUSDPrice,
      symbol: "USG",
    }

    const sgUSDInfo = {
      address: TGUSD_CONTRACT?.SG_USD,
      decimals: 18,
      displayDecimals: 0,
      logo: "USG",
      name: "USG",
      price: stakeInfo?.sgUSDPrice,
      symbol: "USG",
    }

    let logo = assetInfo?.logo as ExistingAsset
    if (option.value === "sdAsset") {
      logo = sgUSDInfo.logo as ExistingAsset
    }

    return (
      <div className="flex items-center gap-2">
        <TokenImage token={logo} size={20} />
        <span className="text-sm font-semibold">{option.label}</span>
      </div>
    )
  }

  const ReceiveAssetDisplay = () => {
    if (!receivedTokenInfo) return <></>

    return (
      <div className="flex items-center gap-2 rounded-[10px] border-2 border-white border-opacity-20 bg-select-input px-3 py-2">
        <TokenImage token={receivedTokenInfo.logo as ExistingAsset} size={20} />
        <span className="text-sm font-semibold">
          <span>{receivedTokenInfo.symbol}</span>
        </span>
      </div>
    )
  }

  return (
    <>
      <div className="flex w-full items-end justify-between gap-4">
        <div className="sgusd-card w-7/12">
          <div className="flex items-center justify-center">
            <Image height={248} width={248} src="/medias/product_tgusd.png" alt="token" />
          </div>
          <div className="flex flex-col items-start justify-center gap-3">
            <span className="text-5xl font-semibold">Savings account</span>
            <p>Stake USG to receive sUSG and earn yield passively. sUSG is an ERC4626 token and can be used further in DeFi. Learn more</p>
          </div>
        </div>

        {stakeInfo && (
          <div className="flex w-5/12 items-center justify-between gap-3 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
            <TokenImage token="sUSG" size={64} />

            <div className="flex flex-col items-center justify-center font-semibold">
              <span className="text-sm text-subtitle">Supply</span>
              <span className="text-lg font-semibold">10,225,145 (7,4%)</span>
            </div>
            <div className="flex flex-col items-center justify-center font-semibold">
              <span className="text-sm text-subtitle">sUSG</span>
              <span className="text-lg font-semibold">{formatDollar(formatUnits(stakeInfo.sgUSDPrice, 18), 2)}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-button-active px-8 py-1">
              <span className="text-black">APY</span>
              <span className="text-lg font-semibold">15.32%</span>
            </div>
          </div>
        )}
      </div>

      <div className="my-8 flex w-full items-start justify-start gap-4">
        <div className="flex w-5/12 flex-col items-center justify-center gap-2 rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px]">
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
              Max: {formatBigInt(currentAssetInfo?.balance, 18, 3)} {currentFeature === "stake" ? "USG" : "sUSG"}{" "}
            </span>
          </div>

          <DepositReceiveInput
            labelDeposit={currentFeature === "stake" ? "You deposit" : "You unstake"}
            labelReceive={currentFeature === "stake" ? "You stake" : "You receive"}
            className="w-full"
            depositAmount={weiValue}
            displayRecieve={true}
            depositSelect={<AssetSelect />}
            disabled={false}
            receiveAssetDisplay={<ReceiveAssetDisplay />}
            depositAsset={currentAssetInfo?.asset}
            receiveDollarValue={(Number(formatUnits(expected || 0n, 18)) * Number(formatUnits(stakeInfo?.sgUSDPrice || 0n, 18)))?.toFixed(2)}
            balance={currentAssetInfo?.balance}
            receiveAmount={formatBigInt(expected, 18, 2)}
            setMaxBalance={() => setWeiValue(currentAssetInfo?.balance)}
            onValueChange={(value: bigint | undefined) => setWeiValue(value)}
            percentage={stakePercentage}
            setPercentage={setStakePercentage}
            displaySliderInput={true}
          />

          <FormButtons
            actions={{
              handleApprove: currentFeature === "stake" ? actionApprove : undefined,
              handleProcess: currentFeature === "stake" ? actionStake : actionUnstake,
            }}
            formState={formState}
            labelProcess={currentFeature === "stake" ? "Deposit & Stake" : "Unstake"}
          />
        </div>
        <div className="flex w-7/12 flex-col items-start justify-start rounded-[10px] bg-overlay-panel px-4 py-2 backdrop-blur-[60px]">
          <span className="text-2xl font-semibold">Performance</span>

          <Divider className="h-1 w-full"></Divider>

          <ForecastGraph
            initialInvestment={Number(formatUnits(stakeInfo?.sgUSDBalance || 0n, 18))}
            apr={15}
            additionalLiquidity={currentFeature === "stake" ? (weiValue ? Number(formatUnits(weiValue!, 18)) : 0) : 0}
          ></ForecastGraph>

          <div className="flex w-full items-center justify-between gap-2">
            <EvolutionBox
              className="w-full"
              originalValue={formatUnits(stakeInfo?.sgUSDBalance || 0n, 18)}
              label="sUSG balance"
              newValue={computeProjectedValue.toString()}
            />

            <EvolutionBox
              className="w-full"
              originalValue={computeProjection(stakeInfo!, 1 / 12, 15).toFixed(2)}
              label="30 days projection"
              newValue={computeProjection(stakeInfo!, 1 / 12, 15, weiValue).toFixed(2)}
            />
            <EvolutionBox
              className="w-full"
              originalValue={computeProjection(stakeInfo!, 1, 15).toFixed(2)}
              label="1 year projection"
              newValue={computeProjection(stakeInfo!, 1, 15, weiValue).toFixed(2)}
            />
          </div>
        </div>
      </div>
    </>
  )
}
