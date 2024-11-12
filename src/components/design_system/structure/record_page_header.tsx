import Panel from "./panel"

export default function RecordPageHeader() {
  return (
    <Panel>
      <div className="flex justify-evenly gap-4">
        <div> APR </div>
        <div>
          {" "}
          <RecordPageHeaderIndicator title="Total XXX Staked" value="10.30M XXX" subValue={"$8.50M"} />
        </div>
        <div>
          {" "}
          <RecordPageHeaderIndicator title="Total XXX Staked" value="10.30M XXX" subValue={"$8.50M"} />{" "}
        </div>
        <div>
          {" "}
          <RecordPageHeaderIndicator title="Total XXX Staked" value="10.30M XXX" subValue={"$8.50M"} />{" "}
        </div>
      </div>
    </Panel>
  )
}

type RecordPageHeaderIndicatorProps = {
  title: string
  value: string | number
  subValue: string | number
  className?: string
}

export const RecordPageHeaderIndicator = ({ title, value, subValue, className }: RecordPageHeaderIndicatorProps) => {
  return (
    <div className={`flex flex-col justify-center lg:items-center ${className}`}>
      <span className="mb-1">{title}</span>
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-sm text-gray-400">{subValue}</span>
    </div>
  )
}
