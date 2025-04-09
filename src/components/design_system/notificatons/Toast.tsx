"use client"

import { useMemo } from "react"

type ToastContentProps = {
  data: { content: string; type: "Success" | "Notification" | "Error" | "Pending Transaction" }
}

export const ToastComponent = ({ data }: ToastContentProps) => {
  const computedTitleClass = useMemo(() => {
    switch (data.type) {
      case "Error":
        return "bg-danger"
      case "Notification":
        return "bg-tonic"
      case "Success":
        return "bg-success"
      case "Pending Transaction":
        return "bg-light-tonic"
    }
  }, [data.type])

  return (
    <div className="flex w-full flex-col rounded-[10px] border border-white border-opacity-30 backdrop-blur-[60px]">
      <div className={`border-b border-b-white border-opacity-20 bg-clip-text px-2 py-1 text-lg font-bold text-transparent ` + ` ${computedTitleClass}`}>
        {data?.type}
      </div>
      <div className="flex items-start justify-start p-2 text-xs text-subtitle">{data?.content}</div>
    </div>
  )
}
