"use client"

import { useNavigationContext } from "./navigation_context"
import { Logo } from "@/components/design_system/structure/logo"
import PanelRaw from "@/components/design_system/structure/panel_raw"

type MenuSideToogleProps = React.HTMLAttributes<HTMLDivElement>

export default function MenuSideToogle({ className, ...props }: MenuSideToogleProps) {
  const { setIsOpen, isOpen } = useNavigationContext()

  return (
    <PanelRaw
      className={`mb-2 flex h-full content-center items-center p-1.5 ${className || ""}`}
      onClick={() => {
        setIsOpen(!isOpen)
      }}
      {...props}
    >
      <Logo className="h-10 w-10" />
    </PanelRaw>
  )
}
