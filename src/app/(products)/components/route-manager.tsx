"use client"

import { usePathname } from "next/navigation"
import MobileMenuBarFeature from "@/components/products/product_nav/mobile_menu_bar_feature"
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
        <div className="usg-container mx-auto flex min-h-[80vh] w-full bg-repeat px-2 md:px-8 lg:px-4">
          <div className="w-full">{children}</div>
        </div>
      )}

      {!isPredeposit && <MobileMenuBarFeature />}
    </>
  )
}
