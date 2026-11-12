"use client"

import { ReactNode } from "react"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

type ClaimNoticeProps = {
  title: string
  description: string
  action: ReactNode
}

export function ClaimNotice({ title, description, action }: ClaimNoticeProps) {
  return (
    <ReliefCard className="flex w-full flex-col items-start gap-5 p-5 md:flex-row md:items-center">
      <div className="flex flex-col gap-1">
        <span className="text-xl font-semibold text-white">{title}</span>
        <span className="text-sm text-subtitle">{description}</span>
      </div>
      <div className="hidden flex-1 md:block" />
      {action}
    </ReliefCard>
  )
}
