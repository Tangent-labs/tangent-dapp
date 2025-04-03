"use client"

import Image from "next/image"
import Panel from "@/components/design_system/structure/panel"
import { useTanStakeContext } from "./stan_context"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import { DepositReceiveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import InputSelect from "@/components/design_system/inputs/input_select"
import { ExistingAsset, SelectOption } from "@/types"
import TokenImage from "@/components/design_system/structure/token_image"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import { ForecastGraph } from "./tan_staking_forecast"
import Divider from "@/components/design_system/structure/divider"
import { computeProjection } from "./stan_controller"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import FormButtons from "@/components/design_system/form/form_actions"
import { TAN_CONTRACT } from "../tan_repository"

export default function STanContent() {
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
  } = useTanStakeContext()

  const AssetSelect = () => {
    return (
      <div className="min-w-48">
        <InputSelect className="w-full" template={AssetSelectTemplate} value={currentAssetInfo?.current} options={depositAssetOptions} onChange={() => {}} />
      </div>
    )
  }

  const AssetSelectTemplate = (option: SelectOption) => {
    const assetInfo = {
      address: TAN_CONTRACT.TAN,
      decimals: 18,
      displayDecimals: 2,
      logo: "tan",
      name: "tan",
      price: stakeInfo?.tanPrice,
      symbol: "tan",
    }

    const sTanInfo = {
      address: "0x374039ebeed6a9185b1ccf320daa2301f26246f6",
      decimals: 18,
      displayDecimals: 0,
      logo: "sTan",
      name: "sTan",
      price: stakeInfo?.sTanPrice,
      symbol: "sTan",
    }

    let logo = assetInfo?.logo as ExistingAsset
    if (option.value === "sdAsset") {
      logo = sTanInfo.logo as ExistingAsset
    }

    return (
      <div className="flex items-center gap-2">
        <TokenImage token={logo} size={32} />
        <span className="text-sm font-bold">{option.label}</span>
      </div>
    )
  }

  const ReceiveAssetDisplay = () => {
    if (!receivedTokenInfo) return <></>

    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <TokenImage token={receivedTokenInfo.logo as ExistingAsset} size={32} />
        <span className="text-sm font-bold leading-3">
          <span>{receivedTokenInfo.symbol}</span>
        </span>
      </PanelRaw>
    )
  }

  return (
    <>
      <div className="flex w-full items-end justify-between">
        <div className="sgusd-card w-7/12">
          <div className="flex items-center justify-center">
            <Image height={440} width={440} className="an-logo" src="/medias/product_tgusd.png" alt="token" />
          </div>
          <div className="flex flex-col items-start justify-between gap-3">
            <span className="text-4xl">sTan</span>
            <p>
              Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools
              <a href="#">(SDT stable pool)</a> &amp; <a href="#">CVX stable pool</a>.
            </p>
            <p>
              Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs. <a href="#">Learn more ↗</a>
            </p>
          </div>
        </div>

        {stakeInfo && (
          <Panel className="flex w-5/12 items-center justify-between gap-3">
            <TokenImage token="sTan" size={48} />

            <div className="flex flex-col items-center justify-center font-bold">
              <span className="text-sm text-subtitle">Supply</span>
              <span className="text-lg font-bold">10,225,145 (7,4%)</span>
            </div>
            <div className="flex flex-col items-center justify-center font-bold">
              <span className="text-sm text-subtitle">sTan</span>
              <span className="text-lg font-bold">{formatDollar(formatUnits(stakeInfo.sTanPrice, 18), 2)}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-button-active px-8 py-2">
              <span className="text-black">APY</span>
              <span className="text-lg font-bold">15.32%</span>
            </div>
          </Panel>
        )}
      </div>

      <div className="my-8 flex w-full items-start justify-start gap-4">
        <Panel className="flex w-full flex-col items-center justify-center gap-2">
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

          <DepositReceiveInput
            labelDeposit={currentFeature === "stake" ? "You deposit" : "You unstake"}
            labelReceive={currentFeature === "stake" ? "You stake" : "You receive"}
            className="w-full"
            depositAmount={weiValue}
            depositSelect={<AssetSelect />}
            disabled={false}
            receiveAssetDisplay={<ReceiveAssetDisplay />}
            depositAsset={currentAssetInfo?.asset}
            receiveDollarValue={(Number(formatUnits(expected || 0n, 18)) * Number(formatUnits(stakeInfo?.sTanPrice || 0n, 18)))?.toFixed(2)}
            balance={currentAssetInfo?.balance}
            receiveAmount={formatBigInt(expected, 18, 2)}
            setMaxBalance={() => {}}
            onValueChange={(value: bigint | undefined) => setWeiValue(value)}
          />

          <FormButtons
            actions={{
              handleApprove: currentFeature === "stake" ? actionApprove : undefined,
              handleProcess: currentFeature === "stake" ? actionStake : actionUnstake,
            }}
            formState={formState}
            labelProcess={currentFeature === "stake" ? "Deposit & Stake" : "Unstake"}
          />
        </Panel>
        <Panel className="flex w-full flex-col items-start justify-start">
          <span className="text-lg font-bold">Performance</span>

          <ForecastGraph
            initialInvestment={Number(formatUnits(stakeInfo?.sTanBalance || 0n, 18))}
            apr={15}
            additionalLiquidity={currentFeature === "stake" ? (weiValue ? Number(formatUnits(weiValue!, 18)) : 0) : 0}
          ></ForecastGraph>

          <div className="flex w-full items-center justify-between gap-2">
            <EvolutionBox originalValue={formatUnits(stakeInfo?.sTanBalance || 0n, 18)} label="sTan balance" newValue={computeProjectedValue.toString()} />

            <EvolutionBox
              originalValue={computeProjection(stakeInfo!, 1 / 12, 15).toFixed(2)}
              label="30 days projection"
              newValue={computeProjection(stakeInfo!, 1 / 12, 15, weiValue).toFixed(2)}
            />
            <EvolutionBox
              originalValue={computeProjection(stakeInfo!, 1, 15).toFixed(2)}
              label="1 year projection"
              newValue={computeProjection(stakeInfo!, 1, 15, weiValue).toFixed(2)}
            />
          </div>
        </Panel>
      </div>
    </>
  )
}
