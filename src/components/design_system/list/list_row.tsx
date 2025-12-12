"use client"

import ListRowDisposition from "@/components/design_system/list/list_row_disposition"

interface ListRowProps {
  children: React.ReactNode[]
  className?: string
  navigate?: () => void
  rowDisposition?: React.ComponentType<{ children: React.ReactNode[] }>
  isSelected?: boolean
}

const ListRow = ({ children, navigate, className = "", rowDisposition: CustomRowDisposition = ListRowDisposition, isSelected = false }: ListRowProps) => {
  return (
    <div
      onClick={() => navigate && navigate()}
      className={`relative bg-overlay-panel px-2 py-1.5 backdrop-blur-[60px] before:absolute before:inset-0 before:-z-10 before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover lg:px-4 ${isSelected ? "before:bg-list-row-hover" : ""} // Selected state styling ${className} `}
    >
      <CustomRowDisposition>
        <> {children?.at(0)}</>
        <> {children?.at(1)}</>
        <> {children?.at(2)}</>
      </CustomRowDisposition>
    </div>
  )
}

export default ListRow
