"use client"
import Link from "next/link"
import Panel from "./panel"
import { usePathname } from "next/navigation"

export type MenuBarLink = {
  href: string
  label: string
}

interface MenuBarProps {
  className?: string
  links: MenuBarLink[]
}

export default function MenuBar({ className, links }: MenuBarProps) {
  const pathname = usePathname()

  return (
    <Panel className={` inline-block ${className || ""}`}>
      <ul className="flex justify-center gap-10  ">
        {links?.map((l) => (
          <li
            key={l.href}
            data-active={pathname === l.href ? "true" : "false"}
            className=" transition-all duration-700 data-[active=true]:text-row-tonic hover:text-row-tonic"
          >
            <Link className="text-sm" href={l.href}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
