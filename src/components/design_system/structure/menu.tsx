"use client"
import Link from "next/link"
import Panel from "./panel"
import { usePathname } from "next/navigation"

export type MenuLink = {
  href: string
  label: string
}

interface MenuProps {
  className?: string
  links: MenuLink[]
}

export default function Menu({ className, links }: MenuProps) {
  const pathname = usePathname()

  return (
    <Panel className={`mx-auto inline-block ${className || ""}`}>
      <ul className="flex justify-center gap-10  ">
        {links?.map((l) => (
          <li
            key={l.href}
            data-active={pathname === l.href ? "true" : "false"}
            className=" transition-all duration-700 data-[active=true]:text-row-tonic hover:text-row-tonic"
          >
            <Link className="text-[14px]" href={l.href}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
