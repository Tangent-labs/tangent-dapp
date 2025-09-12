"use client"

import Image from "next/image"
import { ExistingAsset } from "@/types"
import { DepositReceiveAsset } from "../tg_usd_type"
import { formatBigInt } from "@/lib/number_formatter"
import { useTgUsdSwapContext } from "./tg_usd_swap_context"
import { IconGearWheel } from "@/components/icons/icon_gear_wheel"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { BuySellInput } from "@/components/design_system/inputs/buy_sell_input"
import PopoverCombobox from "@/components/design_system/inputs/popover-combobox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type AssetSelectProps = {
  options: DepositReceiveAsset[]
}

export default function TgUsdSwapContent() {
  const {
    setIsBuying,
    handleDepositChange,
    handleReceiveChange,
    setDepositAsset,
    setReceiveAsset,
    setSlippage,
    setDepositSliderPercent,
    actionSwap,
    actionApprove,
    toggleTokensSwitch,
    formState,
    computedAssets,
    isSwapLoading,
    depositAssetInfo,
    depositWeiValue,
    depositAsset,
    receiveAsset,
    isBuying,
    balances,
    isLoading,
    balanceAllowanceData,
    receiveWeiValue,
    receiveAssetInfo,
    depositSliderPercent,
    slippage,
  } = useTgUsdSwapContext()

  const ReceiveAssetSelect = ({ options }: AssetSelectProps) => {
    if (!balances || !options) {
      return (
        <PopoverCombobox className="w-full" template={AssetSelectTemplate} value={receiveAsset} options={[]} onChange={(v: string) => setReceiveAsset(v)} />
      )
    }

    return (
      <PopoverCombobox className="w-full" template={AssetSelectTemplate} value={receiveAsset} options={options} onChange={(v: string) => setReceiveAsset(v)} />
    )
  }

  const DepositAssetSelect = ({ options }: AssetSelectProps) => {
    if (!balances) {
      return (
        <PopoverCombobox
          className="w-full"
          template={AssetSelectTemplate}
          value={depositAsset || ""}
          options={[]}
          onChange={(v: string) => setDepositAsset(v)}
        />
      )
    }

    return (
      <PopoverCombobox
        className="w-full"
        template={AssetSelectTemplate}
        value={depositAsset || ""}
        options={options}
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
              <>{option.logoURI ? <Image src={option.logoURI} alt={option.logoURI} height={20} width={20} /> : <TokenImage token={option.logo} size={20} />}</>
            )}
          </>
          <span className="text-sm font-semibold">{option.symbol}</span>
        </div>

        <span className="ml-auto text-xs text-subtitle">{formatBigInt(option.balance!, option.decimals!, 2)}</span>
      </div>
    )
  }

  return (
    <>
      <div className="usg-header relative hidden w-7/12 lg:flex">
        <div className="absolute -top-2 left-20 h-full min-h-24">
          <Image height={140} width={140} src="/medias/tokens/swapLogo.png" alt="token" />
        </div>

        <Image className="mr-24 mt-5" height={140} width={140} src="/medias/tokens/tgUSD_header.png" alt="token" />

        <div className="flex flex-col items-start justify-center gap-3">
          <span className="text-5xl font-semibold">Swap</span>
          <p>Swap any asset for USG and other Tangent&apos;s assets, including Curve LPs and Wrapped Tangent Stablecoins. Learn more</p>
        </div>
      </div>

      <div className="mt-2 flex w-full flex-col items-center justify-center">
        <div className="mt-2 flex flex-col items-center justify-center rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
          <BuySellInput
            depositAmount={depositWeiValue}
            depositSelect={<DepositAssetSelect options={computedAssets?.depositAssets} />}
            disabled={false}
            isLoading={isLoading || isSwapLoading}
            receiveSelect={<ReceiveAssetSelect options={computedAssets?.receiveAssets} />}
            labelDeposit={"You Sell"}
            labelReceive={"You Buy"}
            setIsBuying={setIsBuying}
            isBuying={isBuying}
            toggleTokensSwitch={toggleTokensSwitch}
            depositAsset={depositAssetInfo!}
            depositBalance={balanceAllowanceData?.balance ?? 0n}
            receiveAmount={receiveWeiValue}
            receiveAsset={receiveAssetInfo!}
            setMaxBalance={() => handleDepositChange(balanceAllowanceData?.balance)}
            onValueChange={handleDepositChange}
            onReceiveValueChange={handleReceiveChange}
            percentage={depositSliderPercent}
            setPercentage={setDepositSliderPercent}
          />

          <div className="mt-2 flex w-full gap-2">
            <Accordion className="w-full" type="single" collapsible>
              <AccordionItem value="item-1">
                <BorderPanel className="flex w-full cursor-pointer flex-col bg-white bg-opacity-[3%] px-2 text-xs text-primary backdrop-blur-[60px]">
                  <AccordionTrigger>
                    <span className="py-1.5">Details</span>
                  </AccordionTrigger>
                  <AccordionContent className="w-full">
                    <div className="flex w-full flex-col items-center justify-center text-xs text-primary">
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

          <div className="mt-2 flex w-full">
            <FormButtons
              actions={{
                handleApprove: actionApprove,
                handleProcess: actionSwap,
              }}
              formState={formState}
              labelProcess="Swap"
            />
          </div>
        </div>
      </div>
    </>
  )
}
