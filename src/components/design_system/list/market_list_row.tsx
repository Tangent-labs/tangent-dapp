import Link from "next/link"
import { ListGradientBorder } from "./list_gradient_border"
import { cn } from "@/lib/utils"
import { BorrowCapStatus } from "@/types"

interface MarketListRowProps {
  children: React.ReactNode[]
  rowDisposition: React.ComponentType<{ children: React.ReactNode[] }>
  className?: string
  route: string
  borrowCapStatus?: BorrowCapStatus
}

const ROW_BG = "rgba(255, 255, 255, 0.03)"
const CAP_GRADIENT: Record<BorrowCapStatus, string> = {
  none: "",
  warning: "radial-gradient(28% 140% at 100% 50%, rgba(255, 149, 0, 0.1) 0%, rgba(255, 149, 0, 0) 100%)",
  critical: "radial-gradient(28% 140% at 100% 50%, rgba(255, 45, 45, 0.1) 0%, rgba(255, 45, 45, 0) 100%)",
}

export const MarketListRow = ({ children, route, className = "", rowDisposition: CustomRowDisposition, borrowCapStatus = "none" }: MarketListRowProps) => {
  const capGradient = CAP_GRADIENT[borrowCapStatus]
  return (
    <div className="group relative">
      <div
        className={cn("relative cursor-pointer p-[10px] backdrop-blur-[60px] hover-lift-row", `${className}`)}
        style={{
          background: capGradient ? `${capGradient}, ${ROW_BG}` : ROW_BG,
        }}
      >
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
