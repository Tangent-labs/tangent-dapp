"use client"

import { PanelRaw } from "./panel_raw"

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function Panel({ children, className, ...props }: PanelProps) {
  return (
    <PanelRaw className={`mb-2 p-4 ${className}`} {...props}>
      {children}
    </PanelRaw>
  )
}
