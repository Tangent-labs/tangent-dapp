"use client"

import Image from "next/image"
import { useTgUsdDepositContext } from "./tg_usd_record_deposit_context"
import { Switch } from "@/components/ui/switch"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { DepositReceiveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { formatBigInt, formatDollar } from "@/lib/number_formatter"
import CustomSelect from "@/components/design_system/inputs/custom_select"
import { ExistingAsset } from "@/types"
import { ZapToken } from "../../tg_usd_type"
import { formatUnits } from "viem"
import { IconThunder } from "@/components/icons/icon_thunder"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Panel from "@/components/design_system/structure/panel"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import { IconChevron } from "@/components/icons/icon_chevron"
import { IconGearWheel } from "@/components/icons/icon_gear_wheel"

export default function TgUsdDepositPanel() {
  const {
    setDepositAsset,
    setIsDepositAndBorrow,
    setIsStaking,
    setDepositWeiValue,
    actionApprove,
    actionDeposit,
    setBorrowWeiValue,
    handleDepositChange,
    getRouteAndDeposit,
    setSlippage,
    actionApproveZap,
    handleZapInputChange,
    swapAssetPrice,
    isStaking,
    depositAsset,
    depositWeiValue,
    formState,
    borrowWeiValue,
    tokens,
    isZapLoading,
    isDepositLoading,
    isDepositAndBorrow,
    zapValue,
    depositAssetInfo,
    balanceAllowanceData,
    slippage,
    gas,
    sociabilizationFee,
    balances,
    zapInnerValue,
  } = useTgUsdDepositContext()

  const { collateralInfo, marketData, tgUSDInfo } = useTgUsdRecordContext()

  const { canInteract } = useWalletConnexionContext()

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
        ...collateralInfo,
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
      <div className="flex w-full min-w-48 items-center justify-between">
        <div className="flex w-full items-center gap-2">
          {option.logoURI ? <Image src={option.logoURI} alt={option.logoURI} height={16} width={16} /> : <TokenImage token={option.logo} size={16} />}
          <span className="text-sm font-bold">{option.symbol}</span>
        </div>
        <span className="ml-auto text-xs text-gray-400">{formatBigInt(option.balance!, option.decimals!, 2)}</span>
      </div>
    )
  }

  const DepositAssetDisplay = () => {
    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <div className="">
          <TokenImage token={collateralInfo?.logo} size={32} />
        </div>
        <span className="flex flex-col text-lg leading-3">
          <span>{collateralInfo.symbol}</span>
        </span>
      </PanelRaw>
    )
  }

  const BorrowAssetDisplay = () => {
    return (
      <PanelRaw className="flex w-48 items-center gap-2 border-white !bg-opacity-0 px-4 py-2 !backdrop-blur-none">
        <div className="">
          <TokenImage token={"tgUSD"} size={32} />
        </div>
        <span className="flex flex-col text-lg leading-3">
          <span>tgUSD</span>
        </span>
      </PanelRaw>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Save gas</span>
          <Switch checked={isStaking} onCheckedChange={(v) => setIsStaking(v)} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Deposit and borrow</span>
          <Switch checked={isDepositAndBorrow} onCheckedChange={(v) => setIsDepositAndBorrow(v)} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl">Deposit {collateralInfo?.symbol}</span>
        </div>
      </div>

      <DepositReceiveInput
        displayRecieve={false}
        depositAmount={depositWeiValue}
        depositSelect={<AssetSelect />}
        disabled={!canInteract}
        isLoading={isDepositLoading}
        receiveAssetDisplay={<DepositAssetDisplay />}
        depositAsset={depositAssetInfo || collateralInfo}
        receiveDollarValue={(Number(swapAssetPrice) * Number(formatUnits(depositWeiValue || 0n, 18))).toFixed(2)}
        balance={!!depositAssetInfo ? balanceAllowanceData?.balance : marketData?.collateralBalance}
        receiveAmount={"0"}
        isZapping={!!depositAsset && depositAsset !== collateralInfo?.name}
        setMaxBalance={() => {
          setDepositWeiValue(marketData?.collateralBalance || 0n)
        }}
        onValueChange={handleDepositChange}
      />

      {depositAsset && depositAsset !== collateralInfo?.name && (
        <PanelRaw className={`${isZapLoading ? "shimmer" : ""} flex flex-col gap-1 !bg-opacity-20 p-2`}>
          <div className="flex justify-between">
            <div className="flex flex-col items-start justify-start">
              <div className="flex items-center justify-center gap-1">
                <div className="text-sm text-gray-400">Zap</div>
                <IconThunder className="h-auto w-[8px] text-row-tonic" />
                <IconCircleHelp className="h-auto w-[12px] text-row-tonic" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  disabled={isZapLoading}
                  className="flex justify-start bg-transparent text-xl font-bold focus:outline-none"
                  value={zapInnerValue ?? ""}
                  onChange={handleZapInputChange}
                />
                <div className="text-xs">{zapValue ? `(~${formatDollar(Number(formatUnits(zapValue!, 18)).toFixed(0))})` : "$0"}</div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <div>Minimum receive</div>
              </div>
            </div>
            <div className="mb-2 mt-auto flex items-center justify-center gap-2 rounded-xl border border-white/30 px-2">
              <TokenImage token={collateralInfo?.logo} size={32} />
              <div className="font-bold">{collateralInfo?.symbol}</div>
            </div>
          </div>
        </PanelRaw>
      )}

      {isDepositAndBorrow && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">Borrow tgUSD</span>
          </div>
          <DepositReceiveInput
            displayRecieve={false}
            depositAmount={borrowWeiValue}
            labelDeposit="You borrow"
            depositSelect={<BorrowAssetDisplay />}
            disabled={!canInteract}
            depositAsset={tgUSDInfo}
            balance={0n}
            setMaxBalance={() => {}}
            displayBalance={false}
            onValueChange={(value: bigint | undefined) => {
              setBorrowWeiValue(value)
            }}
          />
        </div>
      )}
      <div>
        <FormButtons
          actions={{
            handleApprove: depositAsset && depositAsset !== collateralInfo?.name ? actionApproveZap : actionApprove,
            handleProcess: depositAsset && depositAsset !== collateralInfo?.name ? getRouteAndDeposit : actionDeposit,
          }}
          formState={formState}
          labelProcess="Deposit"
        />
      </div>

      <div className="flex w-full items-end justify-between gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="w-full" title="Slippage">
              <div className="flex h-[30px] w-full cursor-pointer items-center justify-between rounded-xl border border-white/30 px-2 text-xs text-primary hover:bg-white/20">
                Details
                <IconChevron className="h-auto w-[12px] text-row-tonic" />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="center" sideOffset={8} collisionPadding={16} className="z-20 !m-0 w-96 !border-none bg-black !p-0">
            <Panel className="!border-none">
              <div className="flex w-full flex-col items-center justify-center text-primary">
                {gas && gas > 0 ? (
                  <div className="flex w-full items-center justify-between">
                    <div className="flex justify-start">Network cost</div>
                    <div className="flex justify-end">${gas}</div>
                  </div>
                ) : null}
                {slippage && slippage > 0 ? (
                  <div className="flex w-full items-center justify-between">
                    <div className="flex justify-start">Max slippage</div>
                    <div className="flex justify-end">{slippage}%</div>
                  </div>
                ) : null}
                <div className="flex w-full items-center justify-between">
                  <div className="flex justify-start">Sociabilization fee</div>
                  <div className="flex justify-end">{isStaking ? "$0" : `$${sociabilizationFee?.toFixed(2)}`}</div>
                </div>
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
            <button type="button" title="Slippage">
              <div className="h-[30px] cursor-pointer rounded-xl border border-white/30 bg-button-gradient p-2 hover:bg-white/20">
                <IconGearWheel className="h-auto w-[12px] text-row-tonic" />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="center" sideOffset={8} collisionPadding={16} className="z-20 !m-0 w-48 !border-none bg-black !p-0">
            <Panel className="!border-none">
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
            </Panel>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
