"use client"

import Image from "next/image"
import Panel from "@/components/design_system/structure/panel"
import { useTgUsdStakeContext } from "./tg_usd_stake_context"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import { formatUnits } from "viem"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import { DepositRecieveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import InputSelect from "@/components/design_system/inputs/input_select"
import { ExistingAsset, SelectOption } from "@/types"
import TokenImage from "@/components/design_system/structure/token_image"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import { Button } from "@/components/design_system/inputs/button"
import { TGUSD_CONTRACT } from "../tg_usd_repository"

export default function TgUsdClaimContent() {
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
    hasToApprove,
    computeProjectedValue,
  } = useTgUsdStakeContext()

  const AssetSelect = () => {
    return (
      <div className="min-w-48">
        <InputSelect className="w-full" template={AssetSelectTemplate} value={currentAssetInfo?.current} options={depositAssetOptions} onChange={() => {}} />
      </div>
    )
  }

  const AssetSelectTemplate = (option: SelectOption) => {
    const assetInfo = {
      address: TGUSD_CONTRACT.TG_USD,
      decimals: 18,
      displayDecimals: 2,
      logo: "tgUSD",
      name: "tgUSD",
      price: stakeInfo?.tgUSDPrice,
      symbol: "tgUSD",
    }

    const sdAssetInfo = {
      address: "0x374039ebeed6a9185b1ccf320daa2301f26246f6",
      decimals: 18,
      displayDecimals: 0,
      logo: "sgUSD",
      name: "sgUSD",
      price: stakeInfo?.sgUSDPrice,
      symbol: "sgUSD",
    }

    if (!sdAssetInfo || !assetInfo) return <></>

    let logo = assetInfo?.logo as ExistingAsset
    if (option.value === "sdAsset") {
      logo = sdAssetInfo.logo as ExistingAsset
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
            <span className="text-4xl">sgUSD</span>
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
            <TokenImage token="sgUSD" size={48} />

            <div className="flex flex-col items-center justify-center font-bold">
              <span className="text-sm text-subtitle">Supply</span>
              <span className="text-lg font-bold">10,225,145 (7,4%)</span>
            </div>
            <div className="flex flex-col items-center justify-center font-bold">
              <span className="text-sm text-subtitle">sgUSD</span>
              <span className="text-lg font-bold">{formatDollar(formatUnits(stakeInfo.sgUSDPrice, 18))}</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-button-active px-8 py-2">
              <span className="text-black">APY</span>
              <span className="text-lg font-bold">15.32%</span>
            </div>
          </Panel>
        )}
      </div>

      <div className="mt-4 flex w-full items-start justify-start gap-4">
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

          <DepositRecieveInput
            labelDeposit={currentFeature === "stake" ? "You deposit" : "You unstake"}
            labelRecieve={currentFeature === "stake" ? "You stake" : "You receive"}
            className="w-full"
            depositAmount={weiValue}
            depositSelect={<AssetSelect />}
            disabled={false}
            recieveAssetDisplay={<ReceiveAssetDisplay />}
            depositAsset={currentAssetInfo?.asset}
            recieveDollarValue={(Number(formatUnits(expected || 0n, 18)) * Number(formatUnits(stakeInfo?.sgUSDPrice || 0n, 18)))?.toFixed(2)}
            balance={currentAssetInfo?.balance}
            recieveAmount={formatBigInt(expected, 18, 2)}
            setMaxBalance={() => {}}
            onValueChange={(value: bigint | undefined) => setWeiValue(value)}
          />

          {currentFeature === "stake" ? (
            <>
              {hasToApprove ? (
                <Button disabled={!weiValue} onClick={actionApprove} className="flex w-full justify-center" label="Approve">
                  Approve
                </Button>
              ) : (
                <Button disabled={!weiValue} onClick={actionStake} className="flex w-full justify-center" label="Stake">
                  Stake
                </Button>
              )}
            </>
          ) : (
            <Button disabled={!weiValue} onClick={actionUnstake} className="flex w-full justify-center" label="Unstake">
              Unstake
            </Button>
          )}
        </Panel>
        <Panel className="flex w-full flex-col items-start justify-start">
          <span className="text-lg font-bold">Performance</span>

          <div className="flex h-8 w-full items-center justify-between">
            <div className="flex items-center justify-start gap-2">
              <PanelRaw className="flex w-fit items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
                <div className="">
                  <TokenImage token="sgUSD" size={16} />
                </div>
                <span className="text-sm font-bold leading-3">
                  <span>sgUSD</span>
                </span>
              </PanelRaw>

              <div className="flex flex-col items-center justify-center rounded-lg bg-button-active px-4 py-1">
                <span className="text-lg font-bold">15.32%</span>
              </div>
            </div>

            <div className="flex items-end justify-end gap-2">
              <div className="cursor-pointer rounded-xl border border-white/30 px-4 py-1 text-xs">1w</div>
              <div className="cursor-pointer rounded-xl border border-white/30 px-4 py-1 text-xs">1m</div>
              <div className="cursor-pointer rounded-xl border border-white/30 px-4 py-1 text-xs">1y</div>
            </div>
          </div>

          <Panel className="mt-3 flex h-full min-h-56 w-full items-center justify-center">GRAPH</Panel>

          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex min-w-32 flex-col items-start justify-start">
              <span className="text-subtitle">sgUSD balance</span>
              <PanelRaw className="flex w-full items-center justify-between gap-4 px-4 py-1">
                <span className="text-white"> {formatUnits(stakeInfo?.sgUSDBalance || 0n, 18)} </span>
                <span> {"=>"} </span>
                <span className="text-tonic"> {computeProjectedValue} </span>
              </PanelRaw>
            </div>

            <div className="flex min-w-32 flex-col items-start justify-start">
              <span className="text-subtitle">30 days projection</span>
              <PanelRaw className="flex w-full items-center justify-between gap-4 px-4 py-1">
                <span className="text-white"> $150 </span>
                <span> {"=>"} </span>
                <span className="text-tonic"> $2,000 </span>
              </PanelRaw>
            </div>

            <div className="flex min-w-32 flex-col items-start justify-start">
              <span className="text-subtitle">1 year projection</span>
              <PanelRaw className="flex w-full items-center justify-between gap-4 px-4 py-1">
                <span className="text-white"> $1500 </span>
                <span> {"=>"} </span>
                <span className="text-tonic"> $20,000 </span>
              </PanelRaw>
            </div>
          </div>
        </Panel>
      </div>
    </>
  )
}
