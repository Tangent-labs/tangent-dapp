"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { ExistingAsset } from "@/types"
import { ZapToken } from "../../tg_usd_type"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGContext } from "../../tg_usd_context"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { useUSGDepositContext } from "./usg_record_deposit_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { BorrowInput } from "@/components/design_system/inputs/borrow_input"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import PopoverCombobox from "@/components/design_system/inputs/popover-combobox"
import { IconThunder, IconCircleHelp, IconSingleArrow } from "@/components/icons"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { MaxBorrowCapReached } from "@/components/design_system/notifications/max_borrow_cap_reached"
import { MarketTransactionError } from "@/components/design_system/notifications/market_transaction_error"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function USGDepositContent() {
  const {
    setDepositAsset,
    setDepositWeiValue,
    actionApprove,
    actionDeposit,
    setBorrowWeiValue,
    handleDepositChange,
    getRouteAndDeposit,
    setSlippage,
    actionApproveZap,
    handleZapInputChange,
    setDepositSliderPercent,
    setBorrowSliderPercent,
    depositAsset,
    depositWeiValue,
    formState,
    estimatedZapDollarValue,
    borrowWeiValue,
    tokens,
    isZapLoading,
    isDepositLoading,
    zapValue,
    depositAssetInfo,
    slippage,
    zapInnerValue,
    depositSliderPercent,
    borrowSliderPercent,
    maxBorrowableValue,
    maxDepositString,
    aprVariation,
    expectedCollateral,
  } = useUSGDepositContext()

  const { balances } = useUSGContext()

  const { connect } = useWalletConnexionContext()

  const { collateralInfo, marketData, USGInfo, balanceAllowanceData, marketInfo, maxBorrowCapReached, displayAPRVariation, isDepositAndBorrow } =
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
        className="w-full min-w-24"
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

  const BorrowAssetDisplay = () => {
    return (
      <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
        <TokenImage token="USG" size={20} />
        <span className="flex flex-col text-[15px] font-semibold">USG</span>
      </BorderPanel>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-end justify-between gap-2">
        <span className="text-sm font-semibold md:text-xl">Deposit {collateralInfo?.symbol}</span>
        <span className="text-xs text-subtitle">{maxDepositString}</span>
      </div>

      <DepositInput
        displaySliderInput={true}
        depositAmount={depositWeiValue}
        depositSelect={<AssetSelect />}
        isLoading={isDepositLoading}
        depositAsset={depositAssetInfo}
        balance={balanceAllowanceData?.balance || marketData?.collateralBalance}
        isZapping={!!depositAsset && depositAsset !== collateralInfo?.name}
        onValueChange={handleDepositChange}
        percentage={depositSliderPercent}
        setPercentage={setDepositSliderPercent}
        setMaxBalance={() => {
          setDepositWeiValue(balanceAllowanceData?.balance || marketData?.collateralBalance)
        }}
      />

      {depositAsset && depositAsset !== collateralInfo?.symbol && (
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
                  className="flex w-fit max-w-[120px] justify-start bg-transparent text-xl font-semibold focus:outline-none"
                  value={zapInnerValue ?? ""}
                  onChange={handleZapInputChange}
                />
              </div>
              <div className="flex items-center justify-start gap-2 text-xs text-subtitle">
                <div className="hidden md:flex">Minimum received </div>
                <div> {zapValue && !!marketData?.collateralInfos ? estimatedZapDollarValue : ""}</div>
              </div>
            </div>
            <BorderPanel className="flex items-center justify-center gap-2 bg-select-input px-2.5 py-2">
              <TokenImage token={collateralInfo?.logo as ExistingAsset} size={32} />
              <div className="font-semibold">{collateralInfo?.symbol}</div>
            </BorderPanel>
          </div>
        </PanelRaw>
      )}

      {isDepositAndBorrow && (
        <div className="flex flex-col gap-1">
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold md:text-xl">Borrow USG</span>
            <span className="text-xs text-subtitle"> Max: {formatBigInt(maxBorrowableValue, 18, 3)} USG</span>
          </div>
          <BorrowInput
            displaySliderInput={true}
            borrowAmount={borrowWeiValue}
            disabled={maxBorrowCapReached}
            labelDeposit="You borrow"
            depositSelect={<BorrowAssetDisplay />}
            borrowAsset={USGInfo}
            setMaxBalance={maxBorrowCapReached ? () => {} : () => setBorrowWeiValue(maxBorrowableValue)}
            balance={maxBorrowableValue}
            percentage={borrowSliderPercent}
            setPercentage={maxBorrowCapReached ? () => {} : setBorrowSliderPercent}
            onValueChange={(value: bigint | undefined) => {
              setBorrowWeiValue(value)
            }}
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <Accordion className="w-full" type="single" collapsible>
          <AccordionItem value="item-1">
            <BorderPanel className="flex cursor-pointer flex-col bg-white bg-opacity-[3%] px-2 text-xs text-primary">
              <AccordionTrigger>
                <span className="py-1.5">Recap</span>
              </AccordionTrigger>

              <AccordionContent className="w-full">
                <div className={cn("flex flex-col gap-1 rounded-[10px] text-xs", isDepositLoading ? "shimmer" : "")}>
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

                  <div className={cn(displayAPRVariation ? "mt-2 border-t border-white/30 pt-2" : "", "flex w-full items-center justify-between")}>
                    <span className="text-subtitle">Expected collateral: </span>

                    <span className="font-semibold text-white">{expectedCollateral}</span>
                  </div>
                </div>
              </AccordionContent>
            </BorderPanel>
          </AccordionItem>
        </Accordion>

        <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
      </div>

      <MarketTransactionError display={!!borrowWeiValue && formState?.cantProcessReasons.length > 0} error={formState?.cantProcessReasons[0]} />

      <MaxBorrowCapReached display={!borrowWeiValue && isDepositAndBorrow && maxBorrowCapReached} />

      <FormButtons
        actions={{
          handleApprove: depositAsset === "ETH" ? undefined : depositAsset && depositAsset !== collateralInfo?.symbol ? actionApproveZap : actionApprove,
          handleProcess: depositAsset && depositAsset !== collateralInfo?.symbol ? getRouteAndDeposit : actionDeposit,
        }}
        formState={formState}
        labelProcess={isDepositAndBorrow ? "Deposit & Borrow" : "Deposit"}
        connect={connect}
      />
    </div>
  )
}
