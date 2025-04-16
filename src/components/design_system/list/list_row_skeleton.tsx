"use client"

import ListRowDisposition from "@/components/design_system/list/list_row_disposition"
import Panel from "@/components/design_system/structure/panel"

const ListRowSkeleton = () => {
  return (
    <Panel
      className={`relative mb-2 border p-5 before:absolute before:inset-0 before:-z-10 before:rounded-[10px] before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover`}
    >
      <ListRowDisposition>
        <div className="an-skeleton relative h-5 !w-10 rounded-lg max-xl:hidden" />
        <div className="an-skeleton relative h-5 !w-10 rounded-lg max-xl:hidden" />
        <div className="an-skeleton relative h-5 !w-10 rounded-lg" />
      </ListRowDisposition>
    </Panel>
  )
}

export default ListRowSkeleton
