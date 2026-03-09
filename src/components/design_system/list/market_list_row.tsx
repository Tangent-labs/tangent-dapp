import Link from "next/link"
import { ListGradientBorder } from "./list_gradient_border"
import { cn } from "@/lib/utils"

interface MarketListRowProps {
  children: React.ReactNode[]
  rowDisposition: React.ComponentType<{ children: React.ReactNode[] }>
  className?: string
  route: string
  isSelected?: boolean
}

export const MarketListRow = ({ children, route, className = "", rowDisposition: CustomRowDisposition, isSelected = false }: MarketListRowProps) => {
  return (
    <div className="group relative">
      <div
        className={cn("relative cursor-pointer p-1 backdrop-blur-[60px] hover-lift-row", `${className}`)}
        style={{
          background: "rgba(255, 255, 255, 0.03)",
        }}
      >
        <Link href={route}>
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
