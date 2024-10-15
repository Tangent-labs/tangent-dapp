"use client"
import React from "react"
import ListRowDisposition from "./list_row_disposition"
import Panel from "../structure/panel"

interface ListRowProps {
  children: React.ReactNode[]
  className?: string
}

const ListRow = ({ children, className = "" }: ListRowProps) => {
  return (
    <Panel
      className={` hover:cursor-pointer p-5 border  mb-2  before:absolute before:inset-0 before:opacity-70 before:-z-10
         before:rounded-[10px] hover:before:bg-list-row-hover    ${className}`}
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
