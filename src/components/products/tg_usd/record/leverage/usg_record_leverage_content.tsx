"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { ExistingAsset } from "@/types"
import { ZapToken } from "../../tg_usd_type"
import { Switch } from "@/components/ui/switch"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGContext } from "../../tg_usd_context"
import { IconChevron } from "@/components/icons/icon_chevron"
import { IconThunder } from "@/components/icons/icon_thunder"
import Panel from "@/components/design_system/structure/panel"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { IconGearWheel } from "@/components/icons/icon_gear_wheel"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import { useUSGLeverageContext } from "./usg_record_leverage_context"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import PopoverCombobox from "@/components/design_system/inputs/popover-combobox"
import { LeverageInput } from "@/components/design_system/inputs/leverage_input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export default function USGLeverageContent() {
  const {
    setDepositAsset,
    setIsDepositDisabled,
    setDepositWeiValue,
    actionApprove,
    handleDepositChange,
    setSlippage,
    handleZapInputChange,
    setDepositSliderPercent,
    setLeveragePercentage,
    actionLeverage,
    updateBorrowWeiValue,
    actionZapLeverage,
    actionApproveZap,
    depositAsset,
    depositWeiValue,
    formState,
    tokens,
    isZapLoading,
    leverageExceedsMaxLtv,
    isDepositLoading,
    isDepositDisabled,
    zapValue,
    depositAssetInfo,
    slippage,
    estimatedZapDollarValue,
    quoteDetail,
    zapInnerValue,
    depositSliderPercent,
    leveragePercentage,
    maxDepositString,
  } = useUSGLeverageContext()

  const { balances } = useUSGContext()

  const { connect } = useWalletConnexionContext()

  const { collateralInfo, marketData, balanceAllowanceData, marketInfo, pricedCollateralInfo, USGInfo, maxBorrowCapReached } = useUSGRecordContext()

  const AssetSelect = () => {
    const tokenOptions = tokens.map((el: ZapToken) => ({
      ...el,
      value: el.name as string,
      balance: balances ? balances[el.address] : BigInt(0),
    }))

    const sortedAssets = [
      {
        ...collateralInfo,
        value: collateralInfo.name as string,
        balance: balances ? balances[marketInfo?.collatAddress] : BigInt(0),
      },
      ...[
        {
          symbol: "ETH",
          name: "Ethereum",
          value: "ETH",
          decimals: 18,
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          logo: "ETH" as ExistingAsset,
          displayDecimals: 5,
          balance: balances ? balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] : BigInt(0),
        },
        ...tokenOptions,
      ].sort((a, b) => Number(b.balance) - Number(a.balance)),
    ]

    return (
      <PopoverCombobox
        className="w-full"
        template={AssetSelectTemplate}
        value={depositAsset || collateralInfo.name}
        options={sortedAssets}
        onChange={(v: string) => setDepositAsset(v)}
      />
    )
  }

  const AssetSelectTemplate = (option: {
    logoURI?: string
    logo?: ExistingAsset
    value: string
    name?: string
    symbol: string
    balance?: bigint
    decimals?: number
  }) => {
    return (
      <div className="flex w-full min-w-48 cursor-pointer items-center justify-between px-2 py-1 hover:rounded-full hover:bg-white/30">
        <div className="flex w-full items-center gap-2">
          <>
            {option.symbol === "ETH" ? (
              <TokenImage token={option.logo} size={20} />
            ) : (
              <>{option.logoURI ? <Image src={option.logoURI} alt={option.logoURI} height={20} width={20} /> : <TokenImage token={option.logo} size={32} />}</>
            )}
          </>
          <span className="text-sm font-semibold">{option.symbol}</span>
        </div>
        <span className="ml-auto text-xs text-subtitle">{formatBigInt(option.balance!, option.decimals!, 2)}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-subtitle">Leverage only</span>
          <Switch checked={isDepositDisabled} onCheckedChange={(v) => setIsDepositDisabled(v)} />
        </div>
      </div>

      {!isDepositDisabled && (
        <>
          <div className="flex w-full items-end justify-between gap-2">
            <span className="text-sm font-semibold md:text-xl">Deposit {collateralInfo?.symbol}</span>
            <span className="text-xs text-subtitle">{maxDepositString}</span>
          </div>

          <DepositInput
            displaySliderInput={true}
            depositAmount={depositWeiValue}
            depositSelect={<AssetSelect />}
            isLoading={isZapLoading}
            depositAsset={depositAssetInfo}
            balance={!!depositAssetInfo ? balanceAllowanceData?.balance : marketData?.collateralBalance}
            isZapping={!!depositAsset && depositAsset !== collateralInfo?.name}
            onValueChange={handleDepositChange}
            percentage={depositSliderPercent}
            setPercentage={setDepositSliderPercent}
            setMaxBalance={() => {
              setDepositWeiValue(marketData?.collateralBalance || 0n)
            }}
          />
        </>
      )}

      {!isDepositDisabled && depositAsset && depositAsset !== collateralInfo?.symbol && (
        <PanelRaw className={`${isZapLoading ? "shimmer" : ""} flex flex-col gap-1 !bg-opacity-20 p-2`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start justify-start">
              <div className="flex items-center justify-center gap-1">
                <div className="text-sm text-subtitle">Zap</div>
                <IconThunder className="h-auto w-[8px] text-row-tonic" />
                <IconCircleHelp className="h-auto w-[12px] text-row-tonic" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  disabled={isZapLoading}
                  className="flex w-fit max-w-28 justify-start bg-transparent text-xl font-semibold focus:outline-none"
                  value={zapInnerValue ?? ""}
                  onChange={handleZapInputChange}
                />
              </div>

              <div className="flex justify-between gap-2 text-xs text-subtitle">
                <div>Minimum received</div>
                <div>{zapValue && !!marketData?.collateralInfos ? estimatedZapDollarValue : ""}</div>
              </div>
            </div>
            <BorderPanel className="flex items-center justify-center gap-2 bg-select-input px-2.5 py-2">
              <TokenImage token={collateralInfo?.logo} size={32} />
              <div className="font-semibold">{collateralInfo?.symbol}</div>
            </BorderPanel>
          </div>
        </PanelRaw>
      )}

      <>
        <span className="flex items-end justify-between text-sm font-semibold md:text-xl">Borrow amount</span>

        <LeverageInput
          label="You borrow"
          depositAmount={!!zapValue ? zapValue : depositWeiValue}
          borrowAsset={USGInfo}
          depositAsset={pricedCollateralInfo}
          percentage={isDepositDisabled ? 0 : leveragePercentage}
          setPercentage={isDepositDisabled ? undefined : setLeveragePercentage}
          onValueChange={(e) => updateBorrowWeiValue(e)}
        />

        <div className="-mt-1 flex w-full items-start justify-end text-xs text-subtitle">
          Max leverage: x{Number((1 / (1 - Number(marketData?.constants.maxLTV) / 100000)).toFixed(0))}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold md:text-xl">Recap</span>

          <div className={cn("flex flex-col gap-1 rounded-[10px] bg-overlay-panel p-2 text-xs", isDepositLoading ? "shimmer" : "")}>
            {!isDepositDisabled && (
              <div className="flex w-full items-center justify-between">
                <span className="text-subtitle">Leverage</span>
                <span className="text-white">~{leveragePercentage.toFixed(2)}x</span>
              </div>
            )}

            <div className="flex w-full items-center justify-between">
              <span className="text-subtitle">Expected : </span>
              <span className="text-white">
                {quoteDetail?.sum}
                <span className="font-semibold text-white">{quoteDetail?.result}</span>
              </span>
            </div>
          </div>
        </div>
      </>

      <>
        {leverageExceedsMaxLtv && (
          <div className="flex w-full items-center justify-center text-xs text-red-500">
            Price impact too high. Reduce your leverage or add more collateral.
          </div>
        )}
      </>

      <>
        {(!!zapValue || !!depositWeiValue) && maxBorrowCapReached && (
          <div className="flex w-full items-center justify-center text-xs text-red-500">Max borrow cap reached. You cannot borrow USG for now</div>
        )}
      </>

      <FormButtons
        actions={{
          handleApprove: depositAsset && depositAsset !== collateralInfo?.name ? actionApproveZap : actionApprove,
          handleProcess: depositAsset && depositAsset !== collateralInfo?.name ? actionZapLeverage : actionLeverage,
        }}
        connect={connect}
        formState={formState}
        labelProcess={depositAsset && depositAsset !== collateralInfo?.name ? "Zap and leverage" : "Leverage"}
      />

      <div className="flex w-full items-end justify-between gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="w-full font-gilroy" title="Slippage">
              <BorderPanel className="flex h-[30px] w-full cursor-pointer items-center justify-between px-2 text-xs text-primary hover:bg-white/20">
                Details
                <IconChevron className="h-auto w-[12px] text-row-tonic" />
              </BorderPanel>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="center"
            sideOffset={8}
            collisionPadding={16}
            className="z-20 !m-0 w-96 !border-none bg-[#070707] !p-0 font-gilroy"
          >
            <Panel className="!border-none">
              <div className="flex w-full flex-col items-center justify-center text-primary">
                {slippage && slippage > 0 ? (
                  <div className="flex w-full items-center justify-between">
                    <div className="flex justify-start">Max slippage</div>
                    <div className="flex justify-end">{slippage}%</div>
                  </div>
                ) : null}

                <div className="flex w-full items-center justify-between">
                  <div className="flex justify-start">Zapping fee</div>
                  <div className="flex justify-end">--</div>
                </div>
              </div>
            </Panel>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <BorderPanel className="flex h-[30px] cursor-pointer items-center justify-between bg-button-gradient py-2">
              <span className="w-9 px-2 text-xs text-subtitle"> {slippage}%</span>
              <button type="button" title="Slippage">
                <div className="h-[30px] cursor-pointer rounded-[10px] border-l border-white/30 bg-button-gradient p-2 hover:bg-white/20">
                  <IconGearWheel className="h-auto w-[12px] text-row-tonic" />
                </div>
              </button>
            </BorderPanel>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="center" sideOffset={8} collisionPadding={16} className="!m-0 !w-56 border-none">
            <div className="rounded-[10px] border-none bg-white bg-opacity-[3%] p-3 backdrop-blur-[60px]">
              <div className="flex w-full flex-col items-center justify-between gap-2">
                <div className="flex w-full items-center justify-start">Slippage</div>
                <input
                  onChange={(e) => setSlippage(Number(e?.target?.value))}
                  value={slippage || 0}
                  placeholder="0.5"
                  type="number"
                  className="w-full rounded-lg border border-white/30 bg-transparent pl-2 focus:outline-none"
                />
                <div className="mt-2 flex w-full items-center justify-between gap-2">
                  <ButtonTab onClick={() => setSlippage(0.5)} label={"0.5%"} active={slippage === 0.5} className="rounded-full !px-2 !py-1" />
                  <ButtonTab onClick={() => setSlippage(1)} label={"1.0%"} active={slippage === 1} className="rounded-full !px-2 !py-1" />
                  <ButtonTab onClick={() => setSlippage(2)} label={"2.0%"} active={slippage === 2} className="rounded-full !px-2 !py-1" />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
