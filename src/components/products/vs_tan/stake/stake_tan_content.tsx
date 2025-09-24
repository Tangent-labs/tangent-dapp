"use client"

import Image from "next/image"
import { formatUnits } from "viem"
import { ExistingAsset, SelectOption } from "@/types"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { ForecastGraph } from "./tan_staking_forecast"
import { useStakeTanContext } from "./stake_tan_context"
import { computeProjection } from "./stake_tan_controller"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import Divider from "@/components/design_system/structure/divider"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import FormButtons from "@/components/design_system/form/form_actions"
import InputSelect from "@/components/design_system/inputs/input_select"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { DepositReceiveInput } from "@/components/design_system/inputs/deposit_recieve_input"

export default function StakeTanContent() {
  const {
    actionStake,
    actionUnstake,
    setCurrentFeature,
    actionApprove,
    setWeiValue,
    setStakePercentage,
    TANsTANMetrics,
    currentFeature,
    depositAssetOptions,
    currentAssetInfo,
    weiValue,
    expected,
    receivedTokenInfo,
    formState,
    computeProjectedValue,
    stakePercentage,
  } = useStakeTanContext()

  const AssetSelect = () => {
    return <InputSelect className="w-full" template={AssetSelectTemplate} value={currentAssetInfo?.current} options={depositAssetOptions} onChange={() => {}} />
  }

  const AssetSelectTemplate = (option: SelectOption) => {
    const assetInfo = {
      address: VSTAN_CONTRACT.TAN,
      decimals: 18,
      displayDecimals: 2,
      logo: "TAN",
      name: "TAN",
      price: TANsTANMetrics?.tanPrice,
      symbol: "TAN",
    }

    const sTANInfo = {
      address: VSTAN_CONTRACT?.STAN,
      decimals: 18,
      displayDecimals: 0,
      logo: "sTAN",
      name: "sTAN",
      price: TANsTANMetrics?.sTanPrice,
      symbol: "sTAN",
    }

    let logo = assetInfo?.logo as ExistingAsset
    if (option.value === "sdAsset") {
      logo = sTANInfo.logo as ExistingAsset
    }

    return (
      <div className="flex items-center gap-2">
        <TokenImage token={logo} size={24} />
        <span className="text-sm font-semibold">{option.label}</span>
      </div>
    )
  }

  const ReceiveAssetDisplay = () => {
    if (!receivedTokenInfo) return <></>

    return (
      <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
        <TokenImage token={receivedTokenInfo.logo as ExistingAsset} size={24} />
        <span className="text-sm font-semibold">
          <span>{receivedTokenInfo.symbol}</span>
        </span>
      </BorderPanel>
    )
  }

  return (
    <>
      <div className="flex w-full items-end justify-between gap-8">
        <div className="usg-header hidden w-7/12 lg:flex">
          <div className="flex items-center justify-center">
            <Image height={360} width={360} src="/medias/tokens/TAN.png" alt="token" />
          </div>
          <div className="flex flex-col items-start justify-center gap-3">
            <span className="text-5xl font-semibold">Stake TAN</span>
            <p>
              Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools (SDT
              stable pool & CVX stable pool).
            </p>
            <p>Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs. Learn more</p>
          </div>
        </div>

        {TANsTANMetrics && (
          <div className="flex w-5/12 items-center justify-between gap-3 rounded-[10px] bg-overlay-panel p-2 backdrop-blur-[60px]">
            <TokenImage token="sTAN" size={48} />

            <div className="flex flex-col items-center justify-center font-semibold">
              <span className="text-sm text-subtitle">Supply</span>
              <span className="text-lg font-semibold">{formatBigInt(TANsTANMetrics?.sTanSupply, 18, 0)}</span>
            </div>
            <div className="flex flex-col items-center justify-center font-semibold">
              <span className="text-sm text-subtitle">sTan</span>
              <span className="text-lg font-semibold">{formatDollar(formatBigInt(TANsTANMetrics.sTanPrice, 12, 6), 6)}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-button-active px-8 py-2">
              <span className="font-semibold text-black">APR</span>
              <span className="text-lg font-semibold">15.32%</span>
            </div>
          </div>
        )}
      </div>

      <div className="my-8 flex w-full flex-col items-start justify-start gap-4 md:flex-row">
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded-[10px] bg-overlay-panel p-4 backdrop-blur-[60px] md:w-5/12">
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
              Max: {formatBigInt(currentAssetInfo?.balance, 18, 3)} {currentFeature === "stake" ? "TAN" : "sTAN"}
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
            receiveDollarValue={(Number(formatUnits(expected || 0n, 18)) * Number(formatUnits(TANsTANMetrics?.sTanPrice || 0n, 18)))?.toFixed(2)}
            balance={currentAssetInfo?.balance}
            receiveAmount={formatBigInt(expected, 18, 2)}
            setMaxBalance={() => {}}
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
        <div className="flex w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel px-4 py-2 backdrop-blur-[60px] md:w-7/12">
          <span className="text-2xl font-semibold">Performance</span>

          <Divider className="h-1 w-full"></Divider>

          <ForecastGraph
            initialInvestment={Number(formatUnits(TANsTANMetrics?.sTanBalance || 0n, 18))}
            apr={15}
            additionalLiquidity={currentFeature === "stake" ? (weiValue ? Number(formatUnits(weiValue!, 18)) : 0) : 0}
          ></ForecastGraph>

          <div className="flex w-full items-center justify-between gap-2">
            <EvolutionBox
              originalValue={formatBigInt(TANsTANMetrics?.sTanBalance || 0n, 18, 2)}
              label="sTan balance"
              newValue={computeProjectedValue.toString()}
            />

            <EvolutionBox
              originalValue={computeProjection(TANsTANMetrics!, 1 / 12, 15).toFixed(2)}
              label="30 days projection"
              newValue={computeProjection(TANsTANMetrics!, 1 / 12, 15, weiValue).toFixed(2)}
            />
            <EvolutionBox
              originalValue={computeProjection(TANsTANMetrics!, 1, 15).toFixed(2)}
              label="1 year projection"
              newValue={computeProjection(TANsTANMetrics!, 1, 15, weiValue).toFixed(2)}
            />
          </div>
        </div>
      </div>
    </>
  )
}
