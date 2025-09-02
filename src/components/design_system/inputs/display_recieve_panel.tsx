import { formatDollar } from "@/lib/number_formatter"
import PanelRaw from "../structure/panel_raw"
import { cn } from "@/lib/utils"

interface DisplayReceivePanelProps {
  labelReceive: string
  receiveAmount?: string | number
  receiveAssetDisplay?: React.ReactNode
  receiveDollarValue?: string | number
  className?: string
}

const DisplayReceivePanel: React.FC<DisplayReceivePanelProps> = ({
  labelReceive,
  receiveAmount = "-",
  receiveAssetDisplay,
  receiveDollarValue = "-",
  className = "",
}) => {
  return (
    <PanelRaw className={cn("flex flex-col gap-1 !bg-opacity-20 p-2", className)}>
      <div className="text-sm text-gray-400">{labelReceive}</div>
      <div className="mb-2 flex justify-between">
        <div className="text-xl font-medium">{receiveAmount}</div>
        <div>{receiveAssetDisplay}</div>
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <div>({formatDollar(receiveDollarValue)})</div>
      </div>
    </PanelRaw>
  )
}

export default DisplayReceivePanel
