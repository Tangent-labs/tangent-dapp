import Link from "next/link"
import { ListGradientBorder } from "./list_gradient_border"

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
        className={`relative cursor-pointer p-2 backdrop-blur-[60px] transition-all duration-200 ease-out before:absolute before:inset-0 before:-z-10 before:opacity-60 before:transition-all before:duration-300 hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:before:bg-list-row-hover hover:before:opacity-80 ${isSelected ? "before:bg-list-row-hover" : ""} ${className} `}
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
