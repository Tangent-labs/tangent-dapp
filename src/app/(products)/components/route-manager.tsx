"use client"

import { Footer } from "./footer"
import { usePathname } from "next/navigation"
import MenuBarFeature from "@/components/products/product_nav/menu_bar_feature"

export function RouteManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isPredeposit = pathname === "/predeposit"

  return (
    <>
      {!isPredeposit && <MenuBarFeature />}

      {isPredeposit ? (
        <div className="w-full">{children}</div>
      ) : (
        <div className="usg-container mx-auto flex min-h-[85vh] w-full bg-repeat px-2 md:px-8 lg:px-4">
          <div className="w-full">{children}</div>
        </div>
      )}

      <Footer />
    </>
  )
}
