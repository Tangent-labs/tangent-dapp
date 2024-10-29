"use client"
import Link from "next/link"
import Panel from "@/components/design_system/structure/panel"
import { usePathname } from "next/navigation"

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
    <Panel className={` inline-block ${className || ""}`} {...props}>
      <ul className="flex justify-center gap-10  ">
        {links?.map((l) => (
          <li
            key={l.href}
            data-active={pathname === l.href ? "true" : "false"}
            className=" transition-all duration-700 data-[active=true]:text-row-tonic hover:text-row-tonic "
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
