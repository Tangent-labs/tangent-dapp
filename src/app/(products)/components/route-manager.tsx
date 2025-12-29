"use client"

import { usePathname } from "next/navigation"
import { IconTangent } from "@/components/icons"
import MenuBarFeature from "@/components/products/product_nav/menu_bar_feature"
import MobileMenuBarFeature from "@/components/products/product_nav/mobile_menu_bar_feature"
import { PredepositWalletConnect } from "@/components/products/wallet/predeposit_wallet_connect"

export function RouteManager({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isPredeposit = pathname === "/predeposit"

  return (
    <>
      {isPredeposit ? (
        <header className="sticky top-0 z-50 flex h-[80px] w-full font-gilroy backdrop-blur-[60px]">
          <div className="mx-auto flex w-full">
            <div className="flex w-full items-center justify-between bg-overlay-panel backdrop-blur-[60px]">
              <div className="mx-2 flex w-full items-center justify-between lg:mx-4">
                <div className="flex cursor-pointer items-center justify-start gap-2 text-xl text-white">
                  <IconTangent className="mb-2 w-32"></IconTangent>
                </div>

                <div className="mx-6 hidden items-center justify-center lg:flex">
                  <span className="relative h-3 w-3 rounded-full bg-white">
                    <div className="absolute -left-4 top-4 flex items-center justify-center text-sm text-subtitle">Private</div>
                  </span>
                  <span className="w-32 border-t border-white"></span>
                  <span className="relative h-3 w-3 rounded-full border border-white bg-dark">
                    <div className="absolute -left-3 top-4 flex items-center justify-center text-sm text-subtitle">Public</div>
                  </span>
                  <span className="w-32 border-t border-white"></span>
                  <span className="relative h-3 w-3 rounded-full border border-white bg-dark">
                    <div className="absolute -left-6 top-4 flex items-center justify-center text-sm text-subtitle">Retention</div>
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <PredepositWalletConnect />
                </div>
              </div>
            </div>
          </div>
        </header>
      ) : (
        <MenuBarFeature />
      )}

      <div className="usg-container mx-auto flex min-h-[80vh] w-full bg-repeat px-2 md:px-8 lg:px-4">
        <div className="w-full">{children}</div>
      </div>

      {!isPredeposit && <MobileMenuBarFeature />}
    </>
  )
}
