"use client"
import React from "react"
import ListRowDisposition from "@/components/design_system/list/list_row_disposition"
import Panel from "@/components/design_system/structure/panel"

interface ListRowProps {
  children: React.ReactNode[]
  className?: string
  navigate?: () => void
}

const ListRow = ({ children, navigate, className = "" }: ListRowProps) => {
  return (
    <Panel
      onClick={() => navigate && navigate()}
      className={`mb-2 border p-5 before:absolute before:inset-0 before:-z-10 before:rounded-[10px] before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover ${className}`}
    >
      <ListRowDisposition>
        <> {children?.at(0)}</>
        <> {children?.at(1)}</>
        <> {children?.at(2)}</>
      </ListRowDisposition>
    </Panel>
  )
}

export default ListRow
