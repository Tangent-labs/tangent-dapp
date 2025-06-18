"use client"

import { useTgUsdRecordContext } from "../tg_usd_record_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { useTgUsdRepayContext } from "./tg_usd_record_repay_context"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import { Switch } from "@/components/ui/switch"
import { useTgUsdContext } from "../../tg_usd_context"
import { ZapToken } from "../../tg_usd_type"
import { TGUSD_CONTRACT } from "../../tg_usd_repository"
import CustomSelect from "@/components/design_system/inputs/custom_select"
import { ExistingAsset } from "@/types"
import Image from "next/image"
import { IconThunder } from "@/components/icons/icon_thunder"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import { formatUnits } from "viem"
import { RepayInput } from "@/components/design_system/inputs/repay_input"
import Panel from "@/components/design_system/structure/panel"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { IconGearWheel } from "@/components/icons/icon_gear_wheel"
import { IconChevron } from "@/components/icons/icon_chevron"
import ButtonTab from "@/components/design_system/inputs/button_tab"

export default function TgUsdRepayPanel() {
  const { tokens } = useTgUsdContext()

  const { tgUSDInfo, collateralInfo, balances, marketInfo } = useTgUsdRecordContext()

  const { canInteract } = useWalletConnexionContext()

  const {
    actionRepay,
    setPercentage,
    setWithdrawWeiValue,
    setIsRepayAndWithdraw,
    setWithdrawPercentage,
    setRepayAsset,
    handleRepayValueChange,
    actionZapRepay,
    actionApprove,
    setSlippage,
    onClickMax,
    slippage,
    repayWeiValue,
    repayAsset,
    maxRepayableValue,
    formState,
    percentage,
    isRepayAndWithdraw,
    isRepayMax,
    withdrawWeiValue,
    maxWithdrawable,
    withdrawPercentage,
    isZapLoading,
    tgUdsRepayedValue,
    isDebtBelowThreshold,
    repayAssetInfo,
    marketData,
  } = useTgUsdRepayContext()

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
          {option.logoURI ? <Image src={option.logoURI} alt={option.logoURI} height={20} width={20} /> : <TokenImage token={option.logo} size={32} />}
          <span className="text-sm font-semibold">{option.symbol}</span>
        </div>
        <span className="ml-auto text-xs text-gray-400">{formatBigInt(option.balance!, option.decimals!, 2)}</span>
      </div>
    )
  }

  const AssetSelect = () => {
    if (!balances) {
      return null
    }

    const tokenOptions = tokens.map((el: ZapToken) => ({
      ...el,
      value: el.name as string,
      balance: balances[el.address] || BigInt(0),
    }))

    const sortedAssets = [
      {
        address: TGUSD_CONTRACT.TG_USD,
        decimals: 18,
        displayDecimals: 2,
        logo: "tgUSD" as ExistingAsset,
        name: "tgUSD",
        price: 1,
        symbol: "tgUSD",
        value: collateralInfo.name as string,
        balance: balances[marketInfo?.collatAddress] || BigInt(0),
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
          balance: balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] || BigInt(0),
        },
        ...tokenOptions,
      ].sort((a, b) => Number(b.balance - a.balance)),
    ]

    return (
      <CustomSelect
        className="w-full min-w-40"
        template={AssetSelectTemplate}
        value={repayAsset || "tgUSD"}
        options={sortedAssets}
        onChange={(v: string) => setRepayAsset(v)}
      />
    )
  }

  const WithdrawAssetDisplay = () => {
    return (
      <div className="flex items-center gap-2 rounded-[10px] border-2 border-white border-opacity-20 bg-select-input px-3 py-2">
        <TokenImage token={collateralInfo?.logo} size={20} />

        <span className="flex flex-col text-sm font-semibold">
          <span>{collateralInfo.symbol}</span>
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-end justify-end gap-2">
        <div className="flex items-center gap-2 self-end">
          <span className="text-sm text-gray-400">Repay and withdraw</span>
          <Switch checked={isRepayAndWithdraw} onCheckedChange={(v) => setIsRepayAndWithdraw(v)} />
        </div>

        <div className="flex items-center gap-2 self-end">
          <span className="text-sm text-gray-400">Repay All</span>
          <Switch checked={isRepayMax} onCheckedChange={(v) => onClickMax(v)} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-[20px] font-semibold">Repay debt</span>
          <span className="text-xs text-subtitle"> Max: {formatBigInt(marketData?.debtInfos?.userDebt, 18, 3)} tgUSD</span>
        </div>

        <RepayInput
          depositAmount={repayWeiValue}
          labelDeposit="You repay"
          depositSelect={<AssetSelect />}
          disabled={!canInteract || isRepayMax}
          isZapping={!!repayAsset && repayAsset !== "tgUSD"}
          depositAsset={repayAssetInfo || tgUSDInfo}
          balance={maxRepayableValue}
          setMaxBalance={() => handleRepayValueChange(maxRepayableValue)}
          displaySliderInput={true}
          percentage={percentage}
          setPercentage={setPercentage}
          onValueChange={handleRepayValueChange}
        />

        {repayAsset && repayAsset !== "tgUSD" && (
          <PanelRaw className={`${isZapLoading ? "shimmer" : ""} flex flex-col gap-1 !bg-opacity-20 p-2`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-start justify-start">
                <div className="flex items-center justify-center gap-1">
                  <div className="text-sm text-gray-400">Zap</div>
                  <IconThunder className="h-auto w-[8px] text-row-tonic" />
                  <IconCircleHelp className="h-auto w-[12px] text-row-tonic" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="string"
                    placeholder="0"
                    disabled={true}
                    className="flex justify-start bg-transparent text-xl font-semibold focus:outline-none"
                    value={Number(formatUnits(tgUdsRepayedValue || 0n, 18)).toFixed(2) ?? ""}
                  />

                  <div className="text-xs">
                    {tgUdsRepayedValue && tgUSDInfo?.price !== 0
                      ? `(~${formatDollar((Number(Number(formatUnits(tgUdsRepayedValue || 0n, 18))) * tgUSDInfo?.price).toFixed(2))})`
                      : ""}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <div>Minimum received</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-[10px] border-2 border-white border-opacity-20 bg-select-input px-3 py-2">
                <TokenImage token="tgUSD" size={20} />
                <span className="flex flex-col text-[15px] font-semibold">tgUSD</span>
              </div>
            </div>
          </PanelRaw>
        )}

        {isRepayAndWithdraw && (
          <>
            <div className="flex items-end justify-between">
              <span className="text-[20px] font-semibold">Withdraw collateral</span>
              <span className="text-xs text-subtitle">
                Max: {formatBigInt(maxWithdrawable, 18, 2)} {collateralInfo?.symbol}
              </span>
            </div>

            <DepositInput
              depositAmount={withdrawWeiValue}
              labelDeposit="You withdraw"
              depositSelect={<WithdrawAssetDisplay />}
              disabled={!canInteract}
              depositAsset={tgUSDInfo}
              balance={maxWithdrawable}
              displaySliderInput={true}
              setMaxBalance={() => setWithdrawWeiValue(maxWithdrawable)}
              onValueChange={(value: bigint | undefined) => {
                setWithdrawWeiValue(value)
              }}
              percentage={withdrawPercentage}
              setPercentage={setWithdrawPercentage}
            />
          </>
        )}
      </div>

      <>
        {isDebtBelowThreshold && (
          <div className="flex w-full items-center justify-center text-xs text-red-500">Remaining debt can not be lower than $3,000</div>
        )}
      </>

      <div className="flex w-full items-center justify-center">
        <FormButtons
          actions={{
            handleApprove: repayAsset && repayAsset !== "tgUSD" ? actionApprove : undefined,
            handleProcess: repayAsset && repayAsset !== "tgUSD" ? actionZapRepay : actionRepay,
          }}
          formState={formState}
          labelProcess={isRepayAndWithdraw ? "Repay and withdraw" : "Repay"}
        />
      </div>

      <div className="flex w-full items-end justify-between gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="w-full" title="Slippage">
              <div className="flex h-[30px] w-full cursor-pointer items-center justify-between rounded-xl border-2 border-white/30 px-2 text-xs text-primary hover:bg-white/20">
                Details
                <IconChevron className="h-auto w-[12px] text-row-tonic" />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="center" sideOffset={8} collisionPadding={16} className="z-20 !m-0 w-96 !border-none bg-black !p-0">
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
            <div className="flex h-[30px] cursor-pointer items-center justify-between rounded-xl border-2 border-white/30 bg-button-gradient py-2">
              <span className="w-9 px-2 text-xs text-subtitle"> {slippage}%</span>
              <button type="button" title="Slippage">
                <div className="h-[30px] cursor-pointer rounded-xl border-l-2 border-white/30 bg-button-gradient p-2 hover:bg-white/20">
                  <IconGearWheel className="h-auto w-[12px] text-row-tonic" />
                </div>
              </button>
            </div>
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
                  className="w-full rounded-lg border-2 border-white/30 bg-transparent pl-2 focus:outline-none"
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
