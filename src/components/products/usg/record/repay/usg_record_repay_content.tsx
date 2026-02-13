"use client"

import Image from "next/image"
import { ExistingAsset } from "@/types"
import { ZapToken } from "../../usg_type"
import { useUSGContext } from "../../usg_context"
import { USG_CONTRACT } from "../../usg_repository"
import { formatAddress } from "@/lib/other_formatter"
import { formatBigInt } from "@/lib/number_formatter"
import { Address, formatUnits, zeroAddress } from "viem"
import { useUSGRecordContext } from "../usg_record_context"
import { IconThunder } from "@/components/icons/icon_thunder"
import { useUSGRepayContext } from "./usg_record_repay_context"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import FormButtons from "@/components/design_system/form/form_actions"
import InputSelect from "@/components/design_system/inputs/input_select"
import TokenImage from "@/components/design_system/structure/token_image"
import { SlippageInput } from "@/components/design_system/inputs/slippage"
import BorderPanel from "@/components/design_system/structure/border_panel"
import AssetSelectionDialog from "@/components/design_system/inputs/asset-select-dialog"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { PERCENTAGE_INPUT_AMOUNT } from "@/lib/utils"

export default function USGRepayContent() {
  const {
    actionRepay,
    setPercentage,
    setWithdrawWeiValue,
    setWithdrawPercentage,
    setRepayAsset,
    handleRepayValueChange,
    actionZapRepay,
    actionApprove,
    setSlippage,
    setWithdrawSelectedAsset,
    slippage,
    repayWeiValue,
    repayAsset,
    maxRepayableValue,
    formState,
    percentage,
    isRepayMax,
    withdrawWeiValue,
    maxWithdrawable,
    withdrawPercentage,
    USGDollarRepayedValue,
    isZapLoading,
    usgRepayedValue,
    isDebtBelowThreshold,
    repayAssetInfo,
    withdrawSelectedAsset,
    expectedUSG,
  } = useUSGRepayContext()

  const { tokens, balances } = useUSGContext()

  const { connect } = useWalletConnexionContext()

  const { USGInfo, pricedCollateralInfo, marketData, collateralInfo, isRepayAndWithdraw, depositAssetOptions } = useUSGRecordContext()

  const AssetSelectTemplate = (option: {
    logoURI?: string
    logo?: ExistingAsset
    value: string
    name?: string
    symbol: string
    balance?: bigint
    decimals?: number
    address?: Address
  }) => {
    return (
      <div className="flex w-full min-w-48 cursor-pointer items-center justify-between px-2 py-1 hover:rounded-full hover:bg-white/30">
        <div className="flex w-full items-center gap-2">
          <>
            {option.symbol === "ETH" ? (
              <TokenImage token={option.logo} size={32} />
            ) : (
              <>{option.logoURI ? <Image src={option.logoURI} alt={option.logoURI} height={32} width={32} /> : <TokenImage token={option.logo} size={32} />}</>
            )}
          </>

          <div className="flex flex-col items-start justify-start">
            <span className="text-sm font-semibold">{option.symbol}</span>
            <span className="text-xs text-subtitle">{formatAddress(option?.address, 4)}</span>
          </div>
        </div>
        <span className="ml-auto text-xs text-subtitle">{formatBigInt(option.balance!, option.decimals!, 2)}</span>
      </div>
    )
  }

  const AssetSelect = () => {
    if (!!marketData) {
      const tokenOptions = tokens.map((el: ZapToken) => ({
        ...el,
        value: el.name as string,
        address: el.address as Address,
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
          balance: balances ? balances[USG_CONTRACT.USG] : BigInt(0),
        },
        ...[
          {
            symbol: "ETH",
            name: "Ethereum",
            value: "ETH",
            decimals: 18,
            address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address,
            logo: "ETH" as ExistingAsset,
            displayDecimals: 5,
            balance: balances ? balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"] : BigInt(0),
          },
          ...tokenOptions,
        ].sort((a, b) => Number(b.balance) - Number(a.balance)),
      ]

      return (
        <AssetSelectionDialog
          className="w-full min-w-24"
          template={AssetSelectTemplate}
          value={repayAsset || "USG"}
          options={sortedAssets}
          onChange={(v: string) => setRepayAsset(v)}
        />
      )
    }
  }

  const WithdrawAssetSelectTemplate = (option: { logo?: ExistingAsset; label: string }) => {
    return (
      <div className="flex w-full cursor-pointer items-center gap-2 rounded-[10px] py-1 hover:bg-white/10">
        <TokenImage token={option?.logo} size={32} />
        <span className="text-sm font-semibold">{option.label}</span>
      </div>
    )
  }

  const assetSelectElement =
    marketData?.constants?.receipt !== zeroAddress ? (
      <InputSelect
        className="w-full"
        template={WithdrawAssetSelectTemplate}
        value={withdrawSelectedAsset || collateralInfo?.symbol}
        options={depositAssetOptions}
        onChange={(v) => setWithdrawSelectedAsset(v)}
      />
    ) : (
      <StaticCardAssetInput asset={collateralInfo.name as ExistingAsset} />
    )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold md:text-xl">Repay debt</span>

          <span className="text-xs text-subtitle">
            Max: {formatBigInt(maxRepayableValue, repayAssetInfo?.decimals || 18, 3)} {repayAssetInfo?.symbol || "USG"}
          </span>
        </div>

        <GenericInputAssetAmount
          inputWeiValue={repayWeiValue}
          label="You repay"
          depositSelect={<AssetSelect />}
          disabled={isRepayMax}
          isZapping={!!repayAsset && repayAsset !== "USG"}
          asset={repayAssetInfo || USGInfo}
          balance={maxRepayableValue}
          setMaxAmount={() => handleRepayValueChange(maxRepayableValue)}
          displaySliderInput={true}
          sliderPercentage={percentage}
          setSliderPercentage={setPercentage}
          onValueChange={handleRepayValueChange}
          sliderLegendValues={PERCENTAGE_INPUT_AMOUNT}
        />

        {repayAsset && repayAsset !== "USG" && (
          <PanelRaw className={`${isZapLoading ? "shimmer" : ""} flex flex-col gap-1 p-2`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-start justify-start">
                <div className="flex items-center justify-center gap-1">
                  <div className="text-sm text-subtitle">Zap</div>
                  <IconThunder className="h-auto w-[8px] text-row-tonic" />
                  <IconCircleHelp className="h-auto w-[12px] text-row-tonic" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="string"
                    placeholder="0"
                    disabled={true}
                    className="flex justify-start bg-transparent text-xl font-semibold focus:outline-none"
                    value={Number(formatUnits(usgRepayedValue || 0n, 18)).toFixed(2) ?? ""}
                  />
                </div>
                <div className="flex justify-between gap-2 text-xs text-subtitle">
                  <div>Minimum received</div>
                  <div>{usgRepayedValue && USGInfo?.price !== 0 ? USGDollarRepayedValue : ""}</div>
                </div>
              </div>
              <StaticCardAssetInput asset="USG" />
            </div>
          </PanelRaw>
        )}

        {isRepayAndWithdraw && (
          <div className="flex flex-col gap-1">
            <div className="flex items-end justify-between">
              <span className="text-sm font-semibold md:text-xl">Withdraw collateral</span>
              <span className="text-xs text-subtitle">
                Max: {formatBigInt(maxWithdrawable, 18, 2)} {withdrawSelectedAsset}
              </span>
            </div>

            <GenericInputAssetAmount
              inputWeiValue={withdrawWeiValue}
              label="You withdraw"
              depositSelect={assetSelectElement}
              asset={pricedCollateralInfo}
              balance={maxWithdrawable}
              displaySliderInput={true}
              setMaxAmount={() => setWithdrawWeiValue(maxWithdrawable)}
              onValueChange={(value: bigint | undefined) => {
                setWithdrawWeiValue(value)
              }}
              sliderPercentage={withdrawPercentage}
              setSliderPercentage={setWithdrawPercentage}
              sliderLegendValues={PERCENTAGE_INPUT_AMOUNT}
            />
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <Accordion className="w-full" type="single" collapsible>
          <AccordionItem value="item-1">
            <BorderPanel className="flex cursor-pointer flex-col bg-white bg-opacity-[3%] px-2 text-xs text-primary">
              <AccordionTrigger>
                <span className="py-1.5">Recap</span>
              </AccordionTrigger>

              <AccordionContent className="w-full">
                <div className="flex w-full items-center justify-between">
                  <span className="text-subtitle">Expected collateral: </span>

                  <span className="font-semibold text-white">{expectedUSG}</span>
                </div>
              </AccordionContent>
            </BorderPanel>
          </AccordionItem>
        </Accordion>

        <SlippageInput slippage={slippage} setSlippage={setSlippage}></SlippageInput>
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
        labelProcess={isRepayAndWithdraw ? "Repay & withdraw" : "Repay"}
      />
    </div>
  )
}
