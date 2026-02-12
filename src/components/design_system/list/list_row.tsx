"use client"

import ListRowDisposition from "@/components/design_system/list/list_row_disposition"
import Link from "next/link"

interface ListRowProps {
  children: React.ReactNode[]
  className?: string
  route: string
  rowDisposition?: React.ComponentType<{ children: React.ReactNode[] }>
  isSelected?: boolean
}

const ListRow = ({ children, route, className = "", rowDisposition: CustomRowDisposition = ListRowDisposition, isSelected = false }: ListRowProps) => {
  return (
    <div className="group relative">
      <div
        className={`relative bg-overlay-panel px-2 py-1.5 backdrop-blur-[60px] before:absolute before:inset-0 before:-z-10 before:opacity-70 hover:-translate-y-[1px] hover:cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:before:bg-list-row-hover hover:before:opacity-80 lg:px-4 ${isSelected ? "before:bg-list-row-hover" : ""} // Selected state styling ${className} `}
      >
        <Link href={route}>
          <CustomRowDisposition>
            <> {children?.at(0)}</>
            <> {children?.at(1)}</>
            <> {children?.at(2)}</>
          </CustomRowDisposition>
        </Link>
      </div>

      {/* Gradient border effect */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          border: "1px solid transparent",
          background: "linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%) border-box",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
    </div>
  )
}

export default ListRow
