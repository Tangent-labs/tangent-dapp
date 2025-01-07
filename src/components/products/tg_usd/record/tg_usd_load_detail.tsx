"use client"

import Panel from "@/components/design_system/structure/panel"
import React from "react"

type TgUsdLoanDetailProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default function TgUsdLoanDetail({ ...props }: TgUsdLoanDetailProps) {
  return (
    <Panel {...props}>
      <h1>TgUsdLoanDetail</h1>
      <p>This is a client-side component.</p>
    </Panel>
  )
}
