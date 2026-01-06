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
        return <IconBell className="mr-2 w-4 fill-danger" />
      case "Notification":
        return <IconBell className="mr-2 w-4 fill-tonic" />
      case "Success":
        return <IconBell className="mr-2 w-4 fill-success" />
      case "Pending Transaction":
        return <IconBell className="mr-2 w-4 fill-light-tonic" />
    }
  }

  return (
    <div className="flex w-full flex-col rounded-[10px] border-2 border-white border-opacity-20 bg-dark">
      <div className="flex items-center justify-between border-b border-b-white border-opacity-20">
        <div className={`flex min-w-56 items-center justify-start bg-clip-text px-2 py-1 text-lg font-semibold text-transparent ` + ` ${computedTitleClass()}`}>
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

  success: (err: T) => AppToastData
  error?: (err: unknown) => AppToastData

  onSuccess?: (result: T) => AppToastData | Promise<AppToastData>
  onError?: (err: unknown) => void | Promise<void>
}

const defaultErrorMapper = (err: unknown): AppToastData => {
  // Common wallet rejection codes/messages (MetaMask + some providers)
  if (typeof err === "object" && err && "code" in err && err.code === 4001) {
    return { type: "Notification", content: "Transaction rejected in wallet." }
  }

  const msg = err instanceof Error ? err.message : "Transaction failed"
  return { type: "Error", content: msg }
}

export const toastTx = async <T,>(promise: Promise<T>, cfg: ToastTxConfig<T>): Promise<T> => {
  const mapError = cfg.error ?? defaultErrorMapper

  return (await toast.promise(promise, {
    pending: {
      render: ({ closeToast }) => <ToastComponent closeToast={closeToast} data={cfg.pending} />,
    },

    success: {
      render: ({ data, closeToast }) => {
        const result = data as T
        void cfg.onSuccess?.(result)

        const successData = typeof cfg.success === "function" ? cfg.success(result) : cfg.success
        return <ToastComponent closeToast={closeToast} data={successData} />
      },
    },

    error: {
      render: ({ data, closeToast }) => {
        void cfg.onError?.(data)
        return <ToastComponent closeToast={closeToast} data={mapError(data)} />
      },
    },
  })) as T
}
