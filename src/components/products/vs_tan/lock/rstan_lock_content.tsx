"use client"

import Image from "next/image"
import { ExistingAsset } from "@/types"
import { Switch } from "@/components/ui/switch"
import { formatBigInt } from "@/lib/number_formatter"
import { VSTAN_CONTRACT } from "../rs_tan_repository"
import { useUSGContext } from "../../usg/usg_context"
import { useVsTanContext } from "../rstan_layout_context"
import { useVsTanLockContext } from "./rstan_lock_context"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import FormButtons from "@/components/design_system/form/form_actions"
import InputSelect from "@/components/design_system/inputs/input_select"
import TokenImage from "@/components/design_system/structure/token_image"
import BorderPanel from "@/components/design_system/structure/border_panel"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { LockPositionSelectTemplate, ZapToken } from "../../usg/usg_type"
import PopoverCombobox from "@/components/design_system/inputs/popover-combobox"
import { InputSelectLockPosition } from "@/components/design_system/inputs/input_select_lock_position"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import { IconCircleHelp, IconThunder } from "@/components/icons"

export default function VsTanLockContent() {
  const { lockData } = useVsTanContext()

  const { connect } = useWalletConnexionContext()

  const { tokens, balances } = useUSGContext()

  const {
    depositWeiValue,
    depositPositionInfo,
    depositPosition,
    computedNewLockValue,
    isPermaLock,
    isLoading,
    formState,
    depositAsset,
    zapValue,
    zapInnerValue,
    estimatedZapDollarValue,
    isZapLoading,
    depositAssetInfo,
    maxAmountToDeposit,
    slippage,
    setSlippage,
    setDepositAsset,
    setDepositWeiValue,
    setDepositPosition,
    actionLock,
    actionZapAndLock,
    actionApprove,
    actionApproveZap,
    setIsPermaLock,
    handleZapInputChange,
    handleDepositChange,
  } = useVsTanLockContext()

  const PositionSelectTemplate = (option: LockPositionSelectTemplate) => {
    return (
      <>
        {option && option?.tokenId ? (
          <div className="flex items-center gap-2">
            <span className="text-md font-semibold text-white">#{option.tokenId}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-md font-semibold text-white">New</span>
          </div>
        )}
      </>
    )
  }

  const PositionSelect = () => {
    if (!lockData) {
      return (
        <InputSelect
          placeholder="New"
          label="Select position"
          className="w-full min-w-12 xl:min-w-32"
          template={PositionSelectTemplate}
          value={"New"}
          options={[{ value: "New", label: "New" }]}
          onChange={(e) => setDepositPosition(e)}
        />
      )
    }

    const selectOptions = lockData?.positions?.map((el) => {
      return { ...el, value: el.tokenId.toString(), label: el.tokenId.toString() }
    })

    return (
      <InputSelect
        placeholder="New"
        label="Select position"
        className="w-full min-w-24"
        template={PositionSelectTemplate}
        value={depositPosition || "New"}
        options={[{ value: "New", label: "New" }].concat(selectOptions)}
        onChange={(e) => setDepositPosition(e)}
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
            {option.symbol === "ETH" || option.symbol === "TAN" ? (
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

  const AssetSelect = () => {
    const tokenOptions = tokens.map((el: ZapToken) => ({
      ...el,
      value: el.name as string,
      balance: balances ? balances[el.address] : BigInt(0),
    }))

    const sortedAssets = [
      {
        symbol: "TAN",
        name: "TAN",
        value: "TAN",
        decimals: 18,
        address: VSTAN_CONTRACT?.TAN,
        logo: "TAN" as ExistingAsset,
        displayDecimals: 5,
        balance: balances ? balances[VSTAN_CONTRACT?.TAN] : BigInt(0),
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
        value={depositAsset}
        options={sortedAssets}
        onChange={(v: string) => setDepositAsset(v)}
      />
    )
  }

  return (
    <div className="flex w-full flex-col items-start justify-start">
      <div className="mb-1 flex w-full items-end justify-between gap-2">
        <span className="text-lg font-semibold text-white">Deposit Tan</span>
        <span className="text-xs text-subtitle">{maxAmountToDeposit}</span>
      </div>

      <InputSelectLockPosition
        className="w-full"
        depositAmount={depositWeiValue}
        depositSelect={<PositionSelect />}
        assetSelect={<AssetSelect />}
        depositAsset={depositAssetInfo}
        disabled={isLoading}
        isLoading={isLoading}
        balance={lockData?.balance}
        setMaxBalance={() => {
          setDepositWeiValue(lockData?.balance)
        }}
        onValueChange={handleDepositChange}
      />

      {depositAsset !== "TAN" && (
        <PanelRaw className={`${isZapLoading ? "shimmer" : ""} mt-2 flex w-full flex-col gap-1 p-2`}>
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
                  className="flex w-fit max-w-[140px] justify-start bg-transparent text-[24px] font-semibold focus:outline-none"
                  value={zapInnerValue ?? ""}
                  onChange={handleZapInputChange}
                />
              </div>
              <div className="flex items-center justify-start gap-2 text-xs text-subtitle">
                <div className="hidden md:flex">Minimum received </div>
                <div> {!!zapValue ? estimatedZapDollarValue : ""}</div>
              </div>
            </div>
            <BorderPanel className="flex items-center justify-center gap-2 bg-select-input px-2.5 py-2">
              <TokenImage token="TAN" size={24} />
              <div className="font-semibold">TAN</div>
            </BorderPanel>
          </div>
        </PanelRaw>
      )}

      <div className="mt-2 flex w-full justify-end self-end">
        <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
      </div>

      <div className="mb-1 mt-4 flex w-full items-center justify-between">
        <div className="mb-1 text-lg font-semibold text-white">Position recap :</div>

        {depositPosition === "New" && (
          <div className="flex gap-2">
            <div className="mb-1 text-sm text-subtitle">Perma Lock</div>
            <Switch checked={isPermaLock} onCheckedChange={() => setIsPermaLock(!isPermaLock)} />
          </div>
        )}
      </div>

      <div className="flex w-full items-center justify-between gap-4 rounded-[10px] p-3 backdrop-blur-[60px]">
        <EvolutionBox
          className="w-full"
          originalValue={depositPositionInfo ? formatBigInt(depositPositionInfo?.amount, 18, 2) : "0"}
          label="vsTan"
          newValue={computedNewLockValue}
        />
      </div>

      <div className="mt-2 flex w-full items-center justify-center gap-4 rounded-[10px] p-3 text-sm text-subtitle backdrop-blur-[60px]">
        Locking more tokens on a existing position will automatically extend the lock duration to its maximum (12weeks).
      </div>

      <div className="mt-2 flex w-full justify-center">
        <FormButtons
          actions={{
            handleApprove: depositAsset === "TAN" ? actionApprove : actionApproveZap,
            handleProcess: depositAsset === "TAN" ? actionLock : actionZapAndLock,
          }}
          connect={connect}
          formState={formState}
          labelProcess="Lock"
        />
      </div>
    </div>
  )
}
