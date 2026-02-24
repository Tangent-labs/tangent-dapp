"use client"
import Link from "next/link"
import { Panel } from "@/components/design_system/structure/panel"
import { usePathname } from "next/navigation"
import { dappConfig } from "@/dapp_config"

export type MenuBarLink = {
  href: string
  label: string
  disabled?: boolean
}

interface MenuBarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  links: MenuBarLink[]
}

export default function MenuBar({ className, links, ...props }: MenuBarProps) {
  const pathname = usePathname()

  return (
    <Panel className={`inline-block ${className || ""}`} {...props}>
      <ul className="flex justify-center gap-5 md:gap-10">
        {links?.map((l) => (
          <li
            key={l.href}
            data-active={pathname === l.href || (l.href === dappConfig.dappUrl && pathname === "/") ? "true" : "false"}
            className="transition-all duration-200 hover:text-row-tonic data-[active=true]:text-row-tonic"
          >
            <Link className="text-sm aria-disabled:text-gray-700" href={l.href} aria-disabled={l.disabled}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
