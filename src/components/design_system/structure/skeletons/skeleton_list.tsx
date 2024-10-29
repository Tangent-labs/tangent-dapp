"use client"

import ListHeader from "@/components/design_system/list/list_header"
import ListRowSkeleton from "@/components/design_system/list/list_row_skeleton"
import { ListHeaderData } from "@/types"

const headers: ListHeaderData[] = [
  { key: "1", label: "-" },
  { key: "2", label: "-" },
  { key: "3", label: "-" },
  { key: "4", label: "-" },
]

export default function SkeletonList() {
  return (
    <div className="relative">
      <ListHeader headers={headers} />

      {/* Render the rows of data */}
      {[0, 1, 2].map((item, index) => (
        <ListRowSkeleton key={index}></ListRowSkeleton>
      ))}
    </div>
  )
}
