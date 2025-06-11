"use client"

import { IconBell } from "../icons/icon_bell"

type ToastContentProps = {
  data: { content: string; type: "Success" | "Notification" | "Error" | "Pending Transaction" }
}

export const ToastComponent = ({ data }: ToastContentProps) => {
  const computedTitleClass = () => {
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
  }

  const computedIcon = () => {
    switch (data.type) {
      case "Error":
        return <IconBell className="mr-2 w-4 fill-danger"></IconBell>
      case "Notification":
        return <IconBell className="mr-2 w-4 fill-tonic"></IconBell>
      case "Success":
        return <IconBell className="mr-2 w-4 fill-success"></IconBell>
      case "Pending Transaction":
        return <IconBell className="mr-2 w-4 fill-light-tonic"></IconBell>
    }
  }

  return (
    <div className="flex w-full flex-col rounded-[10px] border border-white border-opacity-20 bg-overlay-panel backdrop-blur-[60px]">
      <div className="flex items-center justify-between border-b border-b-white border-opacity-20">
        <div className={`flex items-center justify-start bg-clip-text px-2 py-1 text-lg font-semibold text-transparent ` + ` ${computedTitleClass()}`}>
          {computedIcon()}
          {data?.type}
        </div>
        <div className="flex w-12 items-center justify-center text-xs text-subtitle hover:text-white">✕</div>
      </div>
      <div className="flex items-start justify-start p-2 text-xs text-subtitle">{data?.content}</div>
    </div>
  )
}
