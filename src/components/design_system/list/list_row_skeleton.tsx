"use client"

import ListRowDisposition from "@/components/design_system/list/list_row_disposition"
import BorderPanel from "../structure/border_panel"

const ListRowSkeleton = () => {
  return (
    <BorderPanel
      className={`relative mb-2 p-5 before:absolute before:inset-0 before:-z-10 before:rounded-[10px] before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover`}
    >
      <ListRowDisposition>
        <div className="an-skeleton relative h-5 !w-10 rounded-[10px] max-xl:hidden" />
        <div className="an-skeleton relative h-5 !w-10 rounded-[10px] max-xl:hidden" />
        <div className="an-skeleton relative h-5 !w-10 rounded-[10px]" />
      </ListRowDisposition>
    </BorderPanel>
  )
}

export default ListRowSkeleton
