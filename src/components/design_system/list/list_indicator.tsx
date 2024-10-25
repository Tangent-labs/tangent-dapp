"use client"

interface ListIndicatorProps {
  info: string
  value: string
  valueFirst: boolean
}

const HighLightDisplay = ({ val }: { val?: string }) => {
  return <span className="text-[20px] ">{val}</span>
}

const QuietDisplay = ({ val }: { val?: string }) => {
  return <span className="text-xs text-gray-400"> {val}</span>
}

const ListIndicator = ({ info, value, valueFirst = false }: ListIndicatorProps) => {
  return (
    <div className="flex flex-col items-center leading-5 basis-[48%] md:flex-1">
      {valueFirst ? <HighLightDisplay val={value} /> : <QuietDisplay val={info} />}
      {valueFirst ? <QuietDisplay val={info} /> : <HighLightDisplay val={value} />}
    </div>
  )
}

export default ListIndicator
