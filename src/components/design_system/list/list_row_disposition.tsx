"use client"
import React from "react"

interface ListRowDispositionProps {
  children: React.ReactNode[]
}

const ListRowDisposition = ({ children }: ListRowDispositionProps) => {
  return (
    <div className="flex items-center justify-between max-xl:flex-col">
      <div className="flex w-full items-center justify-evenly xl:w-1/3 xl:justify-start">
        <div className="xl:w-8/12">{children?.at(0)}</div>
        <div className="xl:w-4/12">{children?.at(1)}</div>
      </div>
      <hr className="my-4 w-full opacity-20 xl:hidden" />
      <div className="flex w-full flex-wrap items-center justify-evenly gap-2 xl:w-2/3">{children?.at(2)}</div>
    </div>
  )
}

export default ListRowDisposition
