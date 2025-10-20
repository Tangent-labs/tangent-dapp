"use client"

import { MenuModal } from "@/components/design_system/structure/menu_modal"
import IconDashboard from "@/components/icons/icon_dashboard"
import { IconEarn } from "@/components/icons/icon_earn"
import { IconMarket } from "@/components/icons/icon_market"
import { IconMenuTan } from "@/components/icons/icon_menu_tan"
import { IconSavings } from "@/components/icons/icon_savings"
import { usePathname, useRouter } from "next/navigation"

export default function MobileMenuBarFeature() {
  const router = useRouter()

  const pathname = usePathname()

  return (
    <header className="sticky bottom-0 z-50 flex w-full font-gilroy lg:hidden">
      <div className="flex w-full p-4">
        <div className="flex w-full items-center justify-between rounded-[10px] border border-white border-opacity-20 p-2 text-[10px] backdrop-blur-[60px]">
          <div onClick={() => router.push("/dashboard")} className="flex w-12 cursor-pointer flex-col items-center justify-center">
            <IconDashboard active={pathname === "/dashboard"} className="w-6"></IconDashboard>
            Dashboard
          </div>
          <div onClick={() => router.push("/")} className="flex w-12 cursor-pointer flex-col items-center justify-center">
            <IconMarket active={pathname === "/"} className="w-6"></IconMarket>
            Markets
          </div>
          <div onClick={() => router.push("/stake")} className="flex w-12 cursor-pointer flex-col items-center justify-center">
            <IconSavings active={pathname === "/stake"} className="w-6"></IconSavings>
            Savings
          </div>
          <div onClick={() => router.push("/earn")} className="flex w-12 cursor-pointer flex-col items-center justify-center">
            <IconEarn active={pathname === "/earn"} className="w-6"></IconEarn>
            Earn
          </div>
          <div onClick={() => router.push("/tan/lock")} className="flex w-12 cursor-pointer flex-col items-center justify-center">
            <IconMenuTan active={pathname.includes("tan")} className="w-6"></IconMenuTan>
            Tan
          </div>
          <div className="flex w-12 cursor-pointer flex-col items-center justify-center">
            <MenuModal></MenuModal>
          </div>
        </div>
      </div>
    </header>
  )
}
