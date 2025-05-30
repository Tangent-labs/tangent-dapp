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

export default function TgUsdRepayPanel() {
  const { tokens } = useTgUsdContext()

  const { tgUSDInfo, collateralInfo, balances, marketData } = useTgUsdRecordContext()

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
    onClickMax,
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
    repayAssetInfo,
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
      <div className="flex w-full min-w-48 items-center justify-between">
        <div className="flex w-full items-center gap-2">
          {option.logoURI ? <Image src={option.logoURI} alt={option.logoURI} height={16} width={16} /> : <TokenImage token={option.logo} size={16} />}
          <span className="text-sm font-bold">{option.symbol}</span>
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
        balance: balances[collateralInfo.address] || BigInt(0),
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
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <TokenImage token={collateralInfo?.logo} size={32} />
        <span className="flex flex-col text-lg leading-3">{collateralInfo.symbol}</span>
      </PanelRaw>
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
          <span className="text-[20px] font-bold">Repay debt</span>
          <span className="text-xs text-subtitle"> Max: {formatBigInt(maxRepayableValue, repayAssetInfo?.decimals || 18, 2)} tgUSD</span>
        </div>

        <RepayInput
          depositAmount={repayWeiValue}
          labelDeposit="You repay"
          depositSelect={<AssetSelect />}
          disabled={!canInteract || isRepayMax}
          isZapping={!!repayAsset && repayAsset !== "tgUSD"}
          depositAsset={repayAssetInfo || tgUSDInfo}
          balance={maxRepayableValue}
          displayBalance={false}
          setMaxBalance={() => {}}
          displaySliderInput={true}
          percentage={percentage}
          setPercentage={setPercentage}
          onValueChange={handleRepayValueChange}
          userDebt={maxRepayableValue}
          minimumLoan={marketData?.constants.minimumLoan || 0n}
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
                    className="flex justify-start bg-transparent text-xl font-bold focus:outline-none"
                    value={Number(formatUnits(tgUdsRepayedValue || 0n, 18)).toFixed(2) ?? ""}
                  />

                  <div className="text-xs">
                    {tgUdsRepayedValue && tgUSDInfo?.price !== 0
                      ? `(~${formatDollar((Number(Number(formatUnits(tgUdsRepayedValue || 0n, 18))) * tgUSDInfo?.price).toFixed(2))})`
                      : ""}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <div>Minimum receive</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-[10px] border border-white border-opacity-20 bg-select-input px-3 py-2">
                <TokenImage token="tgUSD" size={24} />
                <span className="flex flex-col text-[15px] font-bold">tgUSD</span>
              </div>
            </div>
          </PanelRaw>
        )}

        {isRepayAndWithdraw && (
          <>
            <div className="flex items-end justify-between">
              <span className="text-[20px] font-bold">Withdraw collateral</span>
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
              setMaxBalance={() => {}}
              displayBalance={false}
              onValueChange={(value: bigint | undefined) => {
                setWithdrawWeiValue(value)
              }}
              percentage={withdrawPercentage}
              setPercentage={setWithdrawPercentage}
            />
          </>
        )}
      </div>

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
    </div>
  )
}
