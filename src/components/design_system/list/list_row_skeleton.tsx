"use client"
import React from "react"
import ListRowDisposition from "./list_row_disposition"
import Panel from "../structure/panel"

const ListRowSkeleton = () => {
  return (
    <Panel
      className={`relative hover:cursor-pointer p-5 border  mb-2  before:absolute before:inset-0 before:opacity-70 before:-z-10
         before:rounded-[10px] hover:before:bg-list-row-hover `}
    >
      <ListRowDisposition>
        <div className="relative rounded-lg max-xl:hidden !w-10 h-5 an-skeleton" />
        <div className="relative rounded-lg max-xl:hidden !w-10 h-5 an-skeleton" />
        <div className="relative rounded-lg  !w-10 h-5 an-skeleton" />
      </ListRowDisposition>
    </Panel>
  )
}

export default ListRowSkeleton
