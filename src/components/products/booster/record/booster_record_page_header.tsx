import { useBoosterRecordContext } from "./booster_record_context"
import RecordPageHeader from "@/components/design_system/structure/record_page_header"

export function BoosterRecordPageHeader() {
  const { apr, headerData, assetInfo } = useBoosterRecordContext()

  return (
    <RecordPageHeader
      token={assetInfo!.logo}
      apr={apr}
      indicators={[
        {
          title: "TVL",
          value: headerData?.tvl?.dollarValue,
          subValue: headerData?.tvl?.tokenAmount,
        },
        {
          title: "Deposited",
          value: headerData?.deposited?.dollarValue,
          subValue: headerData?.deposited?.tokenAmount,
        },
        {
          title: "Claimable",
          value: headerData?.claimable?.dollarValue,
          subValue: headerData?.claimable?.tokenAmount,
        },
      ]}
    />
  )
}
