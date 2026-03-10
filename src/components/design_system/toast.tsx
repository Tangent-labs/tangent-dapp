"use client"

import { IconBell } from "../icons/icon_bell"

import { toast } from "react-toastify"

type ToastType = "Success" | "Notification" | "Error" | "Pending Transaction"

type ToastContentProps = {
  data: { content: string; type: ToastType }
  closeToast?: () => void
}

export const ToastComponent = ({ data, closeToast }: ToastContentProps) => {
  const computedTitleClass = () => {
    switch (data.type) {
      case "Error":
        return "text-danger"
      case "Notification":
        return "text-tonic"
      case "Success":
        return "text-success"
      case "Pending Transaction":
        return "text-tonic"
    }
  }

  const computedIcon = () => {
    switch (data.type) {
      case "Error":
        return <IconBell className="mr-2 w-4 fill-danger" />
      case "Notification":
        return <IconBell className="mr-2 w-4 fill-tonic" />
      case "Success":
        return <IconBell className="mr-2 w-4 fill-success" />
      case "Pending Transaction":
        return <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-tonic border-t-white/40" aria-label="Loading" />
    }
  }

  return (
    <div className="flex w-full flex-col rounded-[10px] border-2 border-white border-opacity-10 bg-dark">
      <div className="flex items-center justify-between border-b border-b-white border-opacity-10">
        <div className={`flex min-w-56 items-center justify-start px-2 py-1 text-lg font-semibold ` + ` ${computedTitleClass()}`}>
          {computedIcon()}
          {data?.type}
        </div>
        <div onClick={closeToast} className="flex w-12 items-center justify-center text-xs text-subtitle hover:text-white">
          ✕
        </div>
      </div>
      <div className="flex items-start justify-start p-2 text-xs text-subtitle">{data?.content}</div>
    </div>
  )
}

export type AppToastData = {
  type: ToastType
  content: string
}

type ToastTxConfig<T> = {
  pending: AppToastData

  success: (result: T) => AppToastData
  error?: (err: unknown) => AppToastData
}

const defaultErrorMapper = (): AppToastData => {
  return { type: "Error", content: "Error" }
}

export const toastTx = async <T,>(promise: Promise<T>, cfg: ToastTxConfig<T>): Promise<T> => {
  const mapError = cfg.error ?? defaultErrorMapper

  return (await toast.promise(promise, {
    pending: {
      render: ({ closeToast }) => <ToastComponent closeToast={closeToast} data={cfg.pending} />,
    },

    success: {
      render: ({ data, closeToast }) => <ToastComponent closeToast={closeToast} data={cfg.success(data)} />,
    },

    error: {
      render: ({ data, closeToast }) => <ToastComponent closeToast={closeToast} data={mapError(data)} />,
    },
  })) as T
}
