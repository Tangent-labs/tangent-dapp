"use client"
import React from "react"

interface ListRowDispositionProps {
  children: React.ReactNode[]
}

const ListRowDisposition = ({ children }: ListRowDispositionProps) => {
  return (
    <div className="flex  max-xl:flex-col items-center justify-between">
      <div className="flex   items-center justify-evenly xl:justify-start w-full xl:w-1/3  ">
        <div className="  xl:w-3/5  ">{children?.at(0)}</div>
        <div className=" xl:w-2/5">{children?.at(1)}</div>
      </div>
      <hr className="w-full opacity-20 my-4 xl:hidden" />
      <div className="flex  items-center justify-evenly  w-full xl:w-2/3 gap-2 flex-wrap ">{children?.at(2)}</div>
    </div>
  )
}

export default ListRowDisposition
