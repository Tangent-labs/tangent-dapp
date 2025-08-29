"use client"

import Image from "next/image"
import { formatUnits } from "viem"
import { USG_CONTRACT } from "../tg_usd_repository"
import { ExistingAsset, SelectOption } from "@/types"
import { ForecastGraph } from "./tg_usd_staking_forecast"
import { useTgUsdStakeContext } from "./tg_usd_stake_context"
import { computeProjection } from "./tg_usd_stake_controller"
import Divider from "@/components/design_system/structure/divider"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import FormButtons from "@/components/design_system/form/form_actions"
import InputSelect from "@/components/design_system/inputs/input_select"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { formatBigInt, formatDollar, formatNumber } from "@/lib/number_formatter"
import { DepositReceiveInput } from "@/components/design_system/inputs/deposit_recieve_input"

export default function TgUsdStakeContent() {
  const {
    actionStake,
    actionUnstake,
    setCurrentFeature,
    actionApprove,
    setStakePercentage,
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
  } = useTgUsdStakeContext()

  const AssetSelect = () => {
    return <InputSelect className="w-full" template={AssetSelectTemplate} value={currentAssetInfo?.current} options={depositAssetOptions} onChange={() => {}} />
  }

  const AssetSelectTemplate = (option: SelectOption) => {
    const assetInfo = {
      address: USG_CONTRACT.USG,
      decimals: 18,
      displayDecimals: 2,
      logo: "USG",
      name: "USG",
      price: stakeInfo?.USGPrice,
      symbol: "USG",
    }

    const sUSGInfo = {
      address: USG_CONTRACT?.SUSG,
      decimals: 18,
      displayDecimals: 0,
      logo: "sUSG",
      name: "sUSG",
      price: stakeInfo?.sUSGPrice,
      symbol: "sUSG",
    }

    let logo = assetInfo?.logo as ExistingAsset
    if (option.value === "sdAsset") {
      logo = sUSGInfo.logo as ExistingAsset
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
      <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
        <TokenImage token={receivedTokenInfo.logo as ExistingAsset} size={20} />
        <span className="text-sm font-semibold">
          <span>{receivedTokenInfo.symbol}</span>
        </span>
      </BorderPanel>
    )
  }

  return (
    <>
      <div className="flex w-full items-end justify-between gap-4">
        <div className="usg-header hidden lg:flex lg:w-7/12">
          <div className="flex items-center justify-center">
            <Image height={160} width={160} src="/medias/product_tgusd.png" alt="token" />
          </div>
          <div className="flex flex-col items-start justify-center gap-3">
            <span className="text-5xl font-semibold">Savings account</span>
            <p className="max-w-[480px]">
              Stake USG to receive sUSG and earn yield passively. sUSG is an ERC4626 token and can be used further in DeFi. Learn more
            </p>
          </div>
        </div>

        {stakeInfo && (
          <div className="flex w-full items-center justify-between gap-3 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px] lg:w-5/12">
            <TokenImage className="hidden sm:flex" token="sUSG" size={48} />

            <div className="flex flex-col items-center justify-center font-semibold">
              <span className="text-sm text-subtitle">Supply</span>
              <span className="text-lg font-semibold">10,225,145 (7,4%)</span>
            </div>
            <div className="flex flex-col items-center justify-center font-semibold">
              <span className="text-sm text-subtitle">sUSG</span>
              <span className="text-lg font-semibold">{formatDollar(formatUnits(stakeInfo.sUSGPrice, 18), 2)}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-button-active px-8 py-1">
              <span className="text-black">APY</span>
              <span className="text-lg font-semibold">15.32%</span>
            </div>
          </div>
        )}
      </div>

      <div className="my-8 flex w-full flex-col items-start justify-start gap-4 lg:flex-row">
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px] lg:w-5/12">
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
            depositSelect={<AssetSelect />}
            disabled={false}
            receiveAssetDisplay={<ReceiveAssetDisplay />}
            depositAsset={currentAssetInfo?.asset}
            receiveDollarValue={(Number(formatUnits(expected || 0n, 18)) * Number(formatUnits(stakeInfo?.sUSGPrice || 0n, 18)))?.toFixed(2)}
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
        <div className="flex w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel px-4 py-2 backdrop-blur-[60px] lg:w-7/12">
          <span className="text-2xl font-semibold">Performance</span>

          <Divider className="h-1 w-full"></Divider>

          <ForecastGraph
            initialInvestment={Number(formatUnits(stakeInfo?.sUSGBalance || 0n, 18))}
            apr={15}
            additionalLiquidity={currentFeature === "stake" ? (weiValue ? Number(formatUnits(weiValue!, 18)) : 0) : 0}
          ></ForecastGraph>

          <div className="flex w-full flex-col items-center justify-between gap-2 sm:flex-row">
            <EvolutionBox
              className="w-full"
              originalValue={formatNumber(Number(formatUnits(stakeInfo?.sUSGBalance || 0n, 18)), 0)}
              label="sUSG balance"
              newValue={formatNumber(computeProjectedValue, 0)}
            />

            <EvolutionBox
              className="w-full"
              originalValue={computeProjection(stakeInfo!, 1 / 12, 15)}
              label="30 days projection"
              newValue={computeProjection(stakeInfo!, 1 / 12, 15, weiValue)}
            />
            <EvolutionBox
              className="w-full"
              originalValue={computeProjection(stakeInfo!, 1, 15)}
              label="1 year projection"
              newValue={computeProjection(stakeInfo!, 1, 15, weiValue)}
            />
          </div>
        </div>
      </div>
    </>
  )
}
