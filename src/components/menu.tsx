"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Menu() {
  const pathname = usePathname()

  return (
    <nav className="flex justify-center gap-5 p-10 font-serif underline">
      <Link href="/" className={(pathname === "/" && "font-semibold") || ""}>
        Home
      </Link>
      <Link href="/dynamic" className={(pathname === "/dynamic" && "font-semibold") || ""}>
        Dynamic
      </Link>
      <Link href="/server" className={(pathname === "/server" && "font-semibold") || ""}>
        Server
      </Link>
      <Link href="/design_system" className={(pathname === "/design_system" && "font-semibold") || ""}>
        Design Sytem
      </Link>
    </nav>
  )
}
