"use client"

import { Footer } from "./footer"
import { usePathname } from "next/navigation"
import MenuBarFeature from "@/components/products/product_nav/menu_bar_feature"

export function RouteManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isPredeposit = pathname === "/predeposit"

  return (
    <div className="flex min-h-screen flex-col">
      {!isPredeposit && <MenuBarFeature />}

      {isPredeposit ? (
        <div className="w-full flex-1">{children}</div>
      ) : (
        <div className="usg-container mx-auto flex w-full flex-1 bg-repeat px-2 md:px-8 lg:px-4">
          <div className="w-full">{children}</div>
        </div>
      )}

      <Footer />
    </div>
  )
}
