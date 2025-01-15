"use client"
import React from "react"
import ListRowDisposition from "@/components/design_system/list/list_row_disposition"
import Panel from "@/components/design_system/structure/panel"

interface ListRowProps {
  children: React.ReactNode[]
  className?: string
  navigate?: () => void
  rowDisposition?: React.ComponentType<{ children: React.ReactNode[] }>
  isSelected?: boolean
}

const ListRow = ({ children, navigate, className = "", rowDisposition: CustomRowDisposition = ListRowDisposition, isSelected = false }: ListRowProps) => {
  return (
    <Panel
      onClick={() => navigate && navigate()}
      className={`mb-2 border p-5 before:absolute before:inset-0 before:-z-10 before:rounded-[10px] before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover ${isSelected ? "before:bg-list-row-hover" : ""} // Selected state styling ${className} `}
    >
      <CustomRowDisposition>
        <> {children?.at(0)}</>
        <> {children?.at(1)}</>
        <> {children?.at(2)}</>
      </CustomRowDisposition>
    </Panel>
  )
}

export default ListRow
