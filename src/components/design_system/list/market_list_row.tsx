import Link from "next/link"
import { cn } from "@/lib/utils"
import { BorrowCapStatus } from "@/types"
import { ListGradientBorder } from "./list_gradient_border"

interface MarketListRowProps {
  children: React.ReactNode[]
  rowDisposition: React.ComponentType<{ children: React.ReactNode[] }>
  className?: string
  route: string
  borrowCapStatus?: BorrowCapStatus
}

const CAP_BG_CLASS: Record<BorrowCapStatus, string> = {
  none: "",
  warning: "bg-cap-warning",
  critical: "bg-cap-critical",
}

export const MarketListRow = ({ children, route, className = "", rowDisposition: CustomRowDisposition, borrowCapStatus = "none" }: MarketListRowProps) => {
  return (
    <div className="group relative">
      <div className={cn("relative cursor-pointer bg-list-row p-[10px] backdrop-blur-[60px] hover-lift-row", CAP_BG_CLASS[borrowCapStatus], className)}>
        <Link
          href={route}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest(".stop-navigation")) e.preventDefault()
          }}
        >
          <CustomRowDisposition>
            <> {children?.at(0)}</>
            <> {children?.at(1)}</>
            <> {children?.at(2)}</>
            <> {children?.at(3)}</>
          </CustomRowDisposition>
        </Link>
      </div>

      <ListGradientBorder />
    </div>
  )
}
