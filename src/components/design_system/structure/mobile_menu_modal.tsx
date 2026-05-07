"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"

type MobileMenuModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export const MobileMenuModal = ({ open, onClose, title, children, className }: MobileMenuModalProps) => {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[10px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-[20px] bg-dark p-5",
            "border border-white/10",
            "duration-500 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
          )}
        >
          <div className="mb-[10px] flex items-center justify-between">
            {!!title ? <DialogPrimitive.Title className="text-xl font-semibold">{title}</DialogPrimitive.Title> : <></>}

            <DialogPrimitive.Close aria-label="Close" className="ml-auto rounded-[10px] opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <hr className="mb-[10px] border-white/20" />
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
