"use client"

import Image from "next/image"
import { ExistingAsset } from "@/types"
import { ZapToken } from "../../tg_usd_type"
import { Switch } from "@/components/ui/switch"
import { formatBigInt } from "@/lib/number_formatter"
import { useUSGContext } from "../../tg_usd_context"
import { IconThunder } from "@/components/icons/icon_thunder"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { IconGearWheel } from "@/components/icons/icon_gear_wheel"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import { useUSGDepositContext } from "./usg_record_deposit_context"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { BorrowInput } from "@/components/design_system/inputs/borrow_input"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import PopoverCombobox from "@/components/design_system/inputs/popover-combobox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function USGDepositContent() {
  const { balances } = useUSGContext()

  const { collateralInfo, marketData, USGInfo, balanceAllowanceData, marketInfo } = useUSGRecordContext()

  const { connect } = useWalletConnexionContext()

  const {
    setDepositAsset,
    setIsDepositAndBorrow,
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
    isDepositAndBorrow,
    zapValue,
    depositAssetInfo,
    slippage,
    gas,
    zapInnerValue,
    depositSliderPercent,
    borrowSliderPercent,
    maxBorrowableValue,
    maxDepositString,
  } = useUSGDepositContext()

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
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-subtitle">Deposit and borrow</span>
          <Switch checked={isDepositAndBorrow} onCheckedChange={(v) => setIsDepositAndBorrow(v)} />
        </div>
      </div>

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
            labelDeposit="You borrow"
            depositSelect={<BorrowAssetDisplay />}
            borrowAsset={USGInfo}
            setMaxBalance={() => setBorrowWeiValue(maxBorrowableValue)}
            balance={maxBorrowableValue}
            percentage={borrowSliderPercent}
            setPercentage={setBorrowSliderPercent}
            onValueChange={(value: bigint | undefined) => {
              setBorrowWeiValue(value)
            }}
          />
        </div>
      )}

      <FormButtons
        actions={{
          handleApprove: depositAsset === "ETH" ? undefined : depositAsset && depositAsset !== collateralInfo?.symbol ? actionApproveZap : actionApprove,
          handleProcess: depositAsset && depositAsset !== collateralInfo?.symbol ? getRouteAndDeposit : actionDeposit,
        }}
        formState={formState}
        labelProcess={"Deposit"}
        connect={connect}
      />

      <div className="flex w-full items-start justify-between gap-2">
        <Accordion className="w-full" type="single" collapsible>
          <AccordionItem value="item-1">
            <BorderPanel className="flex w-full cursor-pointer flex-col bg-white bg-opacity-[3%] px-2 text-xs text-primary backdrop-blur-[60px]">
              <AccordionTrigger>
                <span className="py-1.5">Details</span>
              </AccordionTrigger>
              <AccordionContent className="w-full">
                <div className="flex w-full flex-col items-center justify-center text-xs text-primary">
                  {gas && gas > 0 ? (
                    <div className="flex w-full items-center justify-between">
                      <div className="flex justify-start">Network cost</div>
                      <div className="flex justify-end">${gas}</div>
                    </div>
                  ) : null}

                  {slippage && slippage > 0 ? (
                    <div className="flex w-full items-center justify-between">
                      <div className="ﬂflex w-full justify-start">Max slippage</div>
                      <div className="flex justify-end">{slippage}%</div>
                    </div>
                  ) : null}

                  <div className="flex w-full items-center justify-between">
                    <div className="flex justify-start">Zapping fee</div>
                    <div className="flex justify-end">--</div>
                  </div>
                </div>
              </AccordionContent>
            </BorderPanel>
          </AccordionItem>
        </Accordion>

        <Popover>
          <PopoverTrigger asChild>
            <BorderPanel className="flex h-[30px] cursor-pointer items-center justify-between bg-button-gradient py-2 font-roobert">
              <span className="w-9 px-2 text-xs text-subtitle"> {slippage}%</span>
              <button type="button" title="Slippage">
                <div className="h-[30px] cursor-pointer rounded-[10px] border-l border-white/30 bg-button-gradient p-2 hover:bg-white/20">
                  <IconGearWheel className="h-auto w-[12px] text-row-tonic" />
                </div>
              </button>
            </BorderPanel>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="center" sideOffset={8} collisionPadding={16} className="!m-0 !w-56 border-none font-roobert">
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
