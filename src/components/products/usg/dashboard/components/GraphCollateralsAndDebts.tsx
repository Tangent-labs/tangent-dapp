import { specialTokensList } from "../../usg_repository"
import { formatMillions } from "@/lib/number_formatter"
import { MarketDebtData, USGCollateralData } from "../../usg_type"
import { Divider } from "@/components/design_system/structure/divider"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { InnerTooltip } from "@/components/design_system/structure/inner_tooltip"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { formatEther } from "viem"

type CollateralsAndDebtsProps = {
  userData: {
    totalUserDebt: bigint
    totalUserDeposit: bigint
    totalProtocolDeposit: bigint
    totalProtocolDebt: bigint
    USGCollateralsData: USGCollateralData[]
    marketDebtData: MarketDebtData[]
  }
  marketTVLMaxValue: number
}

const getDebtRatio = (debtValue: bigint, collateralValue: bigint) => {
  if (collateralValue <= 0n) return 0
  const ratio = Number(formatEther(debtValue)) / Number(formatEther(collateralValue))
  return Math.min(1, Math.max(0, ratio))
}

export const GraphCollateralsAndDebts = ({ userData, marketTVLMaxValue }: CollateralsAndDebtsProps) => {
  const collaterals = userData?.USGCollateralsData?.filter((el: USGCollateralData) => el.value > 0) || []
  const debtByMarket = new Map<string, bigint>((userData?.marketDebtData || []).map((el: MarketDebtData) => [el.marketAddress, el.rawValue]))

  return (
    <ReliefCard className="flex h-64 w-full flex-col items-start justify-start p-5">
      <div className="text-xl font-semibold">USG collaterals & debt</div>

      <Divider />

      <div className="mb-2 flex items-center justify-start gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="text-subtitle">Markets: </div>
          <div className="text-white">{collaterals.length}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "rgba(0, 117, 255, 0.5)" }}></span>
          <span className="text-subtitle">TVL</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "rgba(0, 117, 255, 1)" }}></span>
          <span className="text-subtitle">Debt</span>
        </div>
      </div>

      <div className="scrollbar-thin flex w-full flex-col gap-1 overflow-y-auto">
        {collaterals.map((data: USGCollateralData, index: number) => {
          const debtValue = debtByMarket.get(data.marketAddress) ?? 0n
          const debtRatio = getDebtRatio(debtValue, data.rawValue)

          return (
            <div key={index} className="flex w-full items-center justify-start gap-2">
              <InnerTooltip
                innerContent={
                  <div className="flex min-w-24 flex-col items-start justify-center gap-1 px-4">
                    <div className="flex items-center gap-2">
                      <div className="text-subtitle">TVL:</div>
                      <div className="text-white">${formatMillions(formatEther(data.rawValue))}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-subtitle">Debt:</div>
                      <div className="text-white">{formatMillions(formatEther(debtValue))} USG</div>
                    </div>
                  </div>
                }
                key={data?.name}
              >
                <div
                  className="relative h-2 shrink-0 cursor-pointer overflow-hidden rounded-full"
                  style={{
                    width: `calc(${(data.value / marketTVLMaxValue).toFixed(4)} * (100% - 12rem))`,
                    backgroundColor: "rgba(0, 117, 255, 0.5)",
                  }}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ width: `${debtRatio * 100}%`, backgroundColor: "rgba(0, 117, 255, 1)" }}
                  />
                </div>
              </InnerTooltip>

              <div className="flex flex-shrink-0 items-center justify-start gap-1 whitespace-nowrap text-xs">
                <span className="font-semibold">{data.value}%</span>
                <span>{data.name?.replaceAll("-", "/")}</span>

                {specialTokensList.includes(data.name?.substring(0, data.name.indexOf(" ")).trim()) ? (
                  <TokenImage token={data.logoKey} size={16} className="w-4" />
                ) : (
                  <TokenImage token={data.logoKey} size={16} className="w-6" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </ReliefCard>
  )
}
