"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { ExistingAsset } from "@/types"
import { ZapToken } from "../../usg_type"
import { Switch } from "@/components/ui/switch"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGContext } from "../../usg_context"
import { IconThunder } from "@/components/icons/icon_thunder"
import { useUSGRecordContext } from "../usg_record_context"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import { useUSGLeverageContext } from "./usg_record_leverage_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import { IconSingleArrow } from "@/components/icons/icon_single_arrow"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import PopoverCombobox from "@/components/design_system/inputs/popover-combobox"
import { LeverageInput } from "@/components/design_system/inputs/leverage_input"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { MarketTransactionError } from "@/components/design_system/notifications/market_transaction_error"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function USGLeverageContent() {
  const {
    setDepositAsset,
    setIsDepositDisabled,
    setIsLeverageAllPosition,
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
    isLeverageAllPosition,
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
    expectedCollateral,
    zapInnerValue,
    depositSliderPercent,
    leveragePercentage,
    maxDepositString,
    computedMaxLeverage,
    aprVariation,
    computedDepositAmount,
  } = useUSGLeverageContext()

  const { balances } = useUSGContext()

  const { connect } = useWalletConnexionContext()

  const { collateralInfo, marketData, balanceAllowanceData, marketInfo, pricedCollateralInfo, USGInfo, maxBorrowCapReached, displayAPRVariation } =
    useUSGRecordContext()

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
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center justify-between gap-2">
          {!!marketData?.collateralInfos?.positionCollateralAmount && marketData?.collateralInfos?.positionCollateralAmount > 0n && !isLeverageAllPosition && (
            <>
              <span className="text-sm text-subtitle">Leverage only</span>
              <Switch checked={isDepositDisabled} onCheckedChange={(v) => setIsDepositDisabled(v)} />
            </>
          )}

          {!!marketData?.collateralInfos?.positionCollateralAmount && marketData?.collateralInfos?.positionCollateralAmount > 0n && !isDepositDisabled && (
            <>
              <span className="text-sm text-subtitle">Leverage all</span>
              <Switch checked={isLeverageAllPosition} onCheckedChange={(v) => setIsLeverageAllPosition(v)} />
            </>
          )}
        </div>

        <div className="flex items-center justify-start gap-2">
          <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
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
        <div className="flex w-full items-end justify-between">
          <span className="flex items-start justify-start text-sm font-semibold md:text-xl">Borrow amount</span>

          <div className="flex items-end justify-end text-xs text-subtitle">{computedMaxLeverage}</div>
        </div>

        <LeverageInput
          label="You borrow"
          depositAmount={computedDepositAmount}
          borrowAsset={USGInfo}
          depositAsset={pricedCollateralInfo}
          percentage={leveragePercentage}
          setPercentage={setLeveragePercentage}
          onValueChange={(e) => updateBorrowWeiValue(e)}
        />

        <Accordion className="w-full" type="single" collapsible>
          <AccordionItem value="item-1">
            <BorderPanel className="flex w-full cursor-pointer flex-col bg-white bg-opacity-[3%] px-2 text-xs text-primary backdrop-blur-[60px]">
              <AccordionTrigger>
                <span className="py-1.5">Recap</span>
              </AccordionTrigger>
              <AccordionContent className="w-full">
                <div className={cn("flex flex-col gap-1 text-xs", isDepositLoading ? "shimmer" : "")}>
                  <div className="flex w-full items-center justify-between">
                    <span className="text-subtitle">Leverage : </span>
                    <span className="text-white">~{leveragePercentage.toFixed(2)}x</span>
                  </div>

                  {displayAPRVariation && (
                    <>
                      <div className="flex w-full items-center justify-between">
                        <span className="text-subtitle">APR variation : </span>
                      </div>

                      <div className="flex w-full items-center justify-between">
                        <span className="ml-4 italic text-subtitle">Current </span>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-white">{aprVariation.current}</span>
                          <IconSingleArrow></IconSingleArrow>
                          <span className="text-tonic">{aprVariation.currentUpdated}</span>
                        </div>
                      </div>

                      <div className="flex w-full items-center justify-between">
                        <span className="ml-4 italic text-subtitle">Projected </span>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-white">{aprVariation.projected}</span>
                          <IconSingleArrow></IconSingleArrow>
                          <span className="text-tonic">{aprVariation.projectedUpdated}</span>
                        </div>
                      </div>
                    </>
                  )}

                  <div
                    className={cn(
                      displayAPRVariation ? "mt-2 border-t border-white/30 pt-2" : "",
                      "flex w-full flex-col items-start justify-start md:flex-row md:items-center md:justify-between"
                    )}
                  >
                    <span className="text-subtitle">Expected collateral: </span>
                    <span className="text-white">
                      {expectedCollateral?.sum}
                      <span className="font-semibold text-white">{expectedCollateral?.result}</span>
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </BorderPanel>
          </AccordionItem>
        </Accordion>
      </>

      <MarketTransactionError display={!!depositWeiValue && formState?.cantProcessReasons.length > 0} error={formState?.cantProcessReasons[0]} />

      <>
        {leverageExceedsMaxLtv && (
          <div className="flex w-full items-center justify-center text-xs text-red-500">
            Price impact too high. Reduce your leverage or add more collateral.
          </div>
        )}
      </>

      <MaxBorrowCapReached display={(!!zapValue || !!depositWeiValue) && maxBorrowCapReached} />

      <FormButtons
        actions={{
          handleApprove: depositAsset && depositAsset !== collateralInfo?.name ? actionApproveZap : actionApprove,
          handleProcess: depositAsset && depositAsset !== collateralInfo?.name ? actionZapLeverage : actionLeverage,
        }}
        connect={connect}
        formState={formState}
        labelProcess={depositAsset && depositAsset !== collateralInfo?.name ? "Zap and leverage" : "Leverage"}
      />
    </div>
  )
}
