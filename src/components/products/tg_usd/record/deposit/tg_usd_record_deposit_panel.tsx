"use client"

import Image from "next/image"
import { useTgUsdDepositContext } from "./tg_usd_record_deposit_context"
import { Switch } from "@/components/ui/switch"
import { useTgUsdRecordContext } from "../tg_usd_record_context"
import { DepositRecieveInput } from "@/components/design_system/inputs/deposit_recieve_input"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import TokenImage from "@/components/design_system/structure/token_image"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { formatUnits } from "viem"
import { formatDollar } from "@/lib/number_formatter"
import CustomSelect from "@/components/design_system/inputs/custom_select"
import { ExistingAsset } from "@/types"
import { ZapToken } from "../../tg_usd_type"

export default function TgUsdDepositPanel() {
  const {
    isDepositAndBorrow,
    setIsDepositAndBorrow,
    isStaking,
    setDepositAsset,
    depositAsset,
    setIsStaking,
    depositWeiValue,
    setDepositWeiValue,
    actionApprove,
    actionDeposit,
    formState,
    borrowWeiValue,
    setBorrowWeiValue,
    tokens,
    isLoading,
    ensoData,
    swapAssetPrice,
  } = useTgUsdDepositContext()
  const { collateralInfo, marketData, tgUSDInfo } = useTgUsdRecordContext()
  const { canInteract } = useWalletConnexionContext()

  const AssetSelect = () => {
    const tokenOptions = tokens.map((el: ZapToken) => {
      return { ...el, value: el.name as string }
    })

    const assets = [{ ...collateralInfo, value: collateralInfo.name as string }].concat(tokenOptions)

    return (
      <CustomSelect
        className="w-full min-w-48"
        template={AssetSelectTemplate}
        placeholder="Select an asset"
        value={depositAsset || collateralInfo.name}
        options={assets}
        onChange={(v: string) => setDepositAsset(v)}
      />
    )
  }

  const AssetSelectTemplate = (option: { logoURI?: string; logo?: ExistingAsset; value: string; name?: string }) => {
    return (
      <div className="flex items-center gap-2">
        {option.logoURI ? <Image src={option.logoURI} alt={option.logoURI} height={16} width={16} /> : <TokenImage token={option.logo} size={16} />}
        <span className="text-sm font-bold">{option.name}</span>
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
    <>
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

        <DepositRecieveInput
          displayRecieve={false}
          depositAmount={depositWeiValue}
          depositSelect={<AssetSelect />}
          disabled={!canInteract}
          recieveAssetDisplay={<DepositAssetDisplay />}
          depositAsset={collateralInfo}
          recieveDollarValue={"0"}
          balance={marketData?.collateralBalance}
          recieveAmount={"0"}
          setMaxBalance={() => {
            setDepositWeiValue(marketData?.collateralBalance || 0n)
          }}
          onValueChange={(value: bigint | undefined) => setDepositWeiValue(value)}
        />

        {depositAsset && depositAsset !== collateralInfo?.name && (
          <PanelRaw className="flex flex-col gap-1 !bg-opacity-20 p-2">
            <div className="flex justify-between">
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <div className="flex flex-col items-start justify-start">
                  <div className="text-sm text-gray-400">Zap</div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-xl font-bold">{ensoData ? Number(formatUnits(ensoData?.amountOut, 18)).toFixed(2) : "0"} </div>
                    <div className="text-xs">{ensoData && swapAssetPrice ? `(~${formatDollar(Number(formatUnits(ensoData?.amountOut, 18)))})` : "$0"}</div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <div>Minimum receive</div>
                  </div>
                </div>
              )}
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

            <div>
              <DepositRecieveInput
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
          </div>
        )}
        <div>
          <FormButtons actions={{ handleApprove: actionApprove, handleProcess: actionDeposit }} formState={formState} labelProcess="Deposit" />
        </div>
      </div>
    </>
  )
}
