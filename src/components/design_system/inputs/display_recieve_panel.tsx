import React from "react"
import PanelRaw from "../structure/panel_raw"
import { cn } from "@/lib/utils"

interface DisplayReceivePanelProps {
  labelRecieve: string
  recieveAmount?: string | number
  recieveAssetDisplay?: React.ReactNode
  recieveDollarValue?: string | number
  className?: string
}

const DisplayReceivePanel: React.FC<DisplayReceivePanelProps> = ({
  labelRecieve,
  recieveAmount = "-",
  recieveAssetDisplay,
  recieveDollarValue = "-",
  className = "",
}) => {
  return (
    <PanelRaw className={cn("flex flex-col gap-1 !bg-opacity-20 p-2", className)}>
      <div className="text-sm text-gray-400">{labelRecieve}</div>
      <div className="mb-2 flex justify-between">
        <div className="text-xl font-medium">{recieveAmount}</div>
        <div>{recieveAssetDisplay}</div>
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <div>$({recieveDollarValue})</div>
      </div>
    </PanelRaw>
  )
}

export default DisplayReceivePanel
