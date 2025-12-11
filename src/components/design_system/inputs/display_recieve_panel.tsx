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
    <PanelRaw className={cn("flex flex-col gap-1 p-2", className)}>
      <div className="text-sm text-subtitle">{labelReceive}</div>
      <div className="mb-2 flex justify-between">
        <div className="flex items-center justify-center gap-3">
          <div className="text-[24px] font-semibold">{receiveAmount}</div>

          <div className="flex justify-between text-xs text-subtitle">({formatDollar(receiveDollarValue)})</div>
        </div>

        <div>{receiveAssetDisplay}</div>
      </div>
    </PanelRaw>
  )
}

export default DisplayReceivePanel
