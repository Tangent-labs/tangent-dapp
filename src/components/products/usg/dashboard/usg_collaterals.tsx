import { specialTokensList } from "../usg_repository"
import { formatBigInt } from "@/lib/number_formatter"
import { MarketDebtData, USGCollateralData } from "../usg_type"
import Divider from "@/components/design_system/structure/divider"
import TokenImage from "@/components/design_system/structure/token_image"
import InnerTooltip from "@/components/design_system/structure/inner_tooltip"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

type USGCollateralsProps = {
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

export const USGCollaterals = ({ userData, marketTVLMaxValue }: USGCollateralsProps) => {
  return (
    <div className="flex w-full items-start justify-start md:w-1/2">
      <ReliefCard className="flex h-64 w-full flex-col items-start justify-start p-3">
        <div className="text-xl font-semibold">USG collaterals</div>
        <Divider className="h-0.5 w-full bg-white/10" />
        <div className="mb-2 flex items-center justify-start gap-2 text-xs">
          <div className="text-subtitle">Markets: </div>
          <div className="text-white">{userData?.USGCollateralsData?.filter((el: USGCollateralData) => el.value > 0).length}</div>
        </div>

        <div className="scrollbar-thin flex w-full flex-col gap-1 overflow-y-auto">
          {userData?.USGCollateralsData?.filter((el: USGCollateralData) => el.value > 0).map((data: USGCollateralData) => (
            <div key={data?.name} className="flex w-full items-center justify-start gap-2">
              <InnerTooltip
                innerContent={
                  <div className="flex min-w-24 items-center justify-center gap-2 px-4">
                    <div className="text-subtitle">TVL:</div>
                    <div className="text-white">${formatBigInt(data.rawValue, 18, 2)}</div>
                  </div>
                }
                key={data?.name}
              >
                <div
                  className="h-2 flex-grow cursor-pointer rounded-full bg-row-tonic"
                  style={{ maxWidth: `${(data.value / (marketTVLMaxValue + 20)) * 100}%` }}
                ></div>
              </InnerTooltip>

              <div className="flex min-w-[120px] flex-shrink-0 items-center justify-start gap-1 text-xs">
                <span className="font-semibold">{data.value}%</span>
                <span>{data.name}</span>

                {specialTokensList.includes(data.name?.substring(0, data.name.indexOf(" ")).trim()) ? (
                  <TokenImage token={data.name} size={16} className="w-4" />
                ) : (
                  <TokenImage token={data.name} size={16} className="w-6" />
                )}
              </div>
            </div>
          ))}
        </div>
      </ReliefCard>
    </div>
  )
}
