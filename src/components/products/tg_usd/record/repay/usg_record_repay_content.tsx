"use client"

import Image from "next/image"
import { formatUnits } from "viem"
import { ExistingAsset } from "@/types"
import { ZapToken } from "../../tg_usd_type"
import { Switch } from "@/components/ui/switch"
import { useUSGContext } from "../../tg_usd_context"
import { USG_CONTRACT } from "../../tg_usd_repository"
import { IconThunder } from "@/components/icons/icon_thunder"
import { useUSGRepayContext } from "./usg_record_repay_context"
import { useUSGRecordContext } from "../tg_usd_record_context"
import { IconGearWheel } from "@/components/icons/icon_gear_wheel"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import FormButtons from "@/components/design_system/form/form_actions"
import TokenImage from "@/components/design_system/structure/token_image"
import { formatBigInt, formatDisplayValue } from "@/lib/number_formatter"
import { RepayInput } from "@/components/design_system/inputs/repay_input"
import BorderPanel from "@/components/design_system/structure/border_panel"
import { DepositInput } from "@/components/design_system/inputs/deposit_input"
import PopoverCombobox from "@/components/design_system/inputs/popover-combobox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"

export default function USGRepayContent() {
  const { tokens, balances } = useUSGContext()

  const { USGInfo, pricedCollateralInfo, collateralInfo, marketInfo } = useUSGRecordContext()

  const { connect } = useWalletConnexionContext()

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
    tgUsdDollarRepayedValue,
    isZapLoading,
    usgRepayedValue,
    isDebtBelowThreshold,
    repayAssetInfo,
  } = useUSGRepayContext()

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

  const AssetSelect = () => {
    const tokenOptions = tokens.map((el: ZapToken) => ({
      ...el,
      value: el.name as string,
      balance: balances ? balances[el.address] : BigInt(0),
    }))

    const sortedAssets = [
      {
        address: USG_CONTRACT.USG,
        decimals: 18,
        displayDecimals: 2,
        logo: "USG" as ExistingAsset,
        name: "USG",
        price: 1,
        symbol: "USG",
        value: "USG",
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
        value={repayAsset || "USG"}
        options={sortedAssets}
        onChange={(v: string) => setRepayAsset(v)}
      />
    )
  }

  const WithdrawAssetDisplay = () => {
    return (
      <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
        <TokenImage token={collateralInfo?.logo} size={32} />

        <span className="flex flex-col text-sm font-semibold">
          <span>{collateralInfo.symbol}</span>
        </span>
      </BorderPanel>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full items-start justify-start gap-2">
          <div className="flex items-center gap-2 self-end">
            <span className="text-sm text-subtitle">Repay and withdraw</span>
            <Switch checked={isRepayAndWithdraw} onCheckedChange={(v) => setIsRepayAndWithdraw(v)} />
          </div>

          <div className="flex items-center gap-2 self-end">
            <span className="text-sm text-subtitle">Repay All</span>
            <Switch checked={isRepayMax} onCheckedChange={(v) => onClickMax(v)} />
          </div>
        </div>

        <div className="flex items-center justify-start gap-2">
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

      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold md:text-xl">Repay debt</span>

          <span className="text-xs text-subtitle">
            Max: {formatBigInt(maxRepayableValue, repayAssetInfo?.decimals || 18, 3)} {repayAssetInfo?.symbol || "USG"}
          </span>
        </div>

        <RepayInput
          depositAmount={repayWeiValue}
          labelDeposit="You repay"
          depositSelect={<AssetSelect />}
          disabled={isRepayMax}
          isZapping={!!repayAsset && repayAsset !== "USG"}
          depositAsset={repayAssetInfo || USGInfo}
          balance={maxRepayableValue}
          setMaxBalance={() => handleRepayValueChange(maxRepayableValue)}
          displaySliderInput={true}
          percentage={percentage}
          setPercentage={setPercentage}
          onValueChange={handleRepayValueChange}
        />

        {repayAsset && repayAsset !== "USG" && (
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
                    type="text"
                    readOnly
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    disabled={isZapLoading}
                    className="flex w-fit max-w-[120px] justify-start bg-transparent text-xl font-semibold focus:outline-none"
                    value={formatDisplayValue(formatUnits(usgRepayedValue || 0n, 18))}
                  />
                </div>
                <div className="flex justify-between gap-2 text-xs text-subtitle">
                  <div>Minimum received</div>
                  <div>{usgRepayedValue && USGInfo?.price !== 0 ? tgUsdDollarRepayedValue : ""}</div>
                </div>
              </div>
              <BorderPanel className="flex items-center gap-2 bg-select-input px-2.5 py-2">
                <TokenImage token="USG" size={20} />
                <span className="flex flex-col text-[15px] font-semibold">USG</span>
              </BorderPanel>
            </div>
          </PanelRaw>
        )}

        {isRepayAndWithdraw && (
          <>
            <div className="flex items-end justify-between">
              <span className="text-sm font-semibold md:text-xl">Withdraw collateral</span>
              <span className="text-xs text-subtitle">
                Max: {formatBigInt(maxWithdrawable, 18, 2)} {collateralInfo?.symbol}
              </span>
            </div>

            <DepositInput
              depositAmount={withdrawWeiValue}
              labelDeposit="You withdraw"
              depositSelect={<WithdrawAssetDisplay />}
              depositAsset={pricedCollateralInfo}
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
      <>
        {!isDebtBelowThreshold && !!repayWeiValue && formState.cantProcessReasons.length > 0 && (
          <div className="flex w-full items-center justify-center text-xs text-red-500"> {formState.cantProcessReasons[0]}</div>
        )}
      </>

      <FormButtons
        connect={connect}
        actions={{
          handleApprove: repayAsset && repayAsset !== "USG" ? actionApprove : undefined,
          handleProcess: repayAsset && repayAsset !== "USG" ? actionZapRepay : actionRepay,
        }}
        formState={formState}
        labelProcess={isRepayAndWithdraw ? "Repay and withdraw" : "Repay"}
      />
    </div>
  )
}
