"use client"
import React from "react"
import ListRowDisposition from "@/components/design_system/list/list_row_disposition"
import PanelRaw from "../structure/panel_raw"

interface ListRowProps {
  children: React.ReactNode[]
  className?: string
  navigate?: () => void
  rowDisposition?: React.ComponentType<{ children: React.ReactNode[] }>
  isSelected?: boolean
}

const ListRow = ({ children, navigate, className = "", rowDisposition: CustomRowDisposition = ListRowDisposition, isSelected = false }: ListRowProps) => {
  return (
    <PanelRaw
      onClick={() => navigate && navigate()}
      className={`border px-5 py-3 before:absolute before:inset-0 before:-z-10 before:rounded-[10px] before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover ${isSelected ? "before:bg-list-row-hover" : ""} // Selected state styling ${className} `}
    >
      <CustomRowDisposition>
        <> {children?.at(0)}</>
        <> {children?.at(1)}</>
        <> {children?.at(2)}</>
      </CustomRowDisposition>
    </PanelRaw>
  )
}

export default ListRow
