import { AssetDataPriced, CollateralInfo, ExistingAsset } from "@/types"
import PanelRaw from "../structure/panel_raw"
import { IconThunder } from "@/components/icons/icon_thunder"
import { IconCircleHelp } from "@/components/icons/icon_circle_help"
import BorderPanel from "../structure/border_panel"
import TokenImage from "../structure/token_image"
import { MarketDetailData } from "@/components/products/tg_usd/tg_usd_type"

type ZapInputProps = {
  collateralInfo: CollateralInfo | AssetDataPriced
  isZapLoading: boolean
  zapInnerValue: string
  handleZapInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleZapBlur: () => void
  zapValue: bigint
  marketData: MarketDetailData
  estimatedZapDollarValue: string
}

export const ZapInput = ({
  collateralInfo,
  isZapLoading,
  zapInnerValue,
  handleZapInputChange,
  handleZapBlur,
  zapValue,
  marketData,
  estimatedZapDollarValue,
}: ZapInputProps) => {
  return (
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
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              disabled={isZapLoading}
              className="flex w-fit max-w-[120px] justify-start bg-transparent text-xl font-semibold focus:outline-none"
              value={zapInnerValue}
              onChange={handleZapInputChange}
              onBlur={handleZapBlur}
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
  )
}
