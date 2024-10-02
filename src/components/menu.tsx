"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Menu() {
  const pathname = usePathname()

  return (
    <nav className="flex justify-center gap-5 font-serif p-10 underline ">
      <Link href="/" className={(pathname === "/" && "font-bold") || ""}>
        Home
      </Link>
      <Link href="/dynamic" className={(pathname === "/dynamic" && "font-bold") || ""}>
        Dynamic
      </Link>
      <Link href="/server" className={(pathname === "/server" && "font-bold") || ""}>
        Server
      </Link>
      <Link href="/design_system" className={(pathname === "/design_system" && "font-bold") || ""}>
        Design Sytem
      </Link>
    </nav>
  )
}
