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
    <div
      className={`relative bg-overlay-panel px-2 py-1.5 backdrop-blur-[60px] before:absolute before:inset-0 before:-z-10 before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover lg:px-4 ${isSelected ? "before:bg-list-row-hover" : ""} // Selected state styling ${className} `}
    >
      <Link href={route}>
        <CustomRowDisposition>
          <> {children?.at(0)}</>
          <> {children?.at(1)}</>
          <> {children?.at(2)}</>
        </CustomRowDisposition>
      </Link>
    </div>
  )
}

export default ListRow
