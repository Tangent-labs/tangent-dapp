"use client"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuDropdown,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import { useCallback } from "react"
import { useRootContext } from "../root/root_context"
import { usePathname, useRouter } from "next/navigation"
import { IconTangent } from "@/components/icons/icon_tangent"
import { mapRouteToFeature } from "./menu_bar_feature_controller"
import { IconTangentLogo } from "@/components/icons/icon_tangent_logo"
import TokenImage from "@/components/design_system/structure/token_image"
import { WalletConnexionContent } from "../wallet/wallet_connexion_content"
import { formatCompact } from "@/lib/number_formatter"
import { IconHarvest } from "@/components/icons/icon_harvest"
import { IconForum } from "@/components/icons/icon_forum"
import { IconSnapshot } from "@/components/icons/icon_snapshot"
import { IconTask } from "@/components/icons/icon_task"
import { IconReferral } from "@/components/icons/icon_referral"
import { IconBoosts } from "@/components/icons/icon_boosts"

export default function MenuBarFeature() {
  const { USGCurrentSupply, sUSGCurrentAPY } = useRootContext()

  const router = useRouter()

  const pathname = usePathname()

  const computedFeature = useCallback(() => {
    return mapRouteToFeature(pathname.substring(1, pathname.length))
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 flex h-[80px] w-full font-gilroy backdrop-blur-[60px]">
      <div className="mx-auto flex w-full">
        <div className="mx-4 flex w-full items-center justify-between">
          <div className="flex w-full items-center justify-start gap-3">
            <div onClick={() => router.push("/")} className="hidden cursor-pointer items-center gap-2 text-xl text-white md:flex">
              <IconTangent className="mb-2 w-32"></IconTangent>
            </div>
            <div onClick={() => router.push("/")} className="flex cursor-pointer items-center gap-4 text-xl text-white md:hidden">
              <IconTangentLogo className="mb-2 mr-2 w-12 border-r border-white/30 px-2"></IconTangentLogo>

              {computedFeature()}
            </div>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem
                  className={pathname === "/dashboard" ? "bg-white/10 font-semibold hover:bg-white/20" : "hover:bg-white/10"}
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </NavigationMenuItem>
                <NavigationMenuItem
                  className={pathname === "/" ? "bg-white/10 font-semibold hover:bg-white/20" : "hover:bg-white/10"}
                  onClick={() => router.push("/")}
                >
                  Markets
                </NavigationMenuItem>
                <NavigationMenuItem
                  className={pathname === "/stake" ? "bg-white/10 font-semibold hover:bg-white/20" : "hover:bg-white/10"}
                  onClick={() => router.push("/stake")}
                >
                  Savings
                </NavigationMenuItem>

                <NavigationMenuItem
                  className={pathname === "/earn" ? "bg-white/10 font-semibold hover:bg-white/20" : "hover:bg-white/10"}
                  onClick={() => router.push("/earn")}
                >
                  Earn
                </NavigationMenuItem>

                <NavigationMenuItem
                  className={pathname === "/claim" ? "bg-white/10 font-semibold hover:bg-white/20" : "hover:bg-white/10"}
                  onClick={() => router.push("/claim")}
                >
                  Claim
                </NavigationMenuItem>

                <NavigationMenu>
                  <NavigationMenuDropdown>
                    <NavigationMenuTrigger>DAO</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="flex w-[120px] flex-col gap-1 rounded-[10px] bg-[#070707] p-2">
                        <NavigationMenuLink className="flex items-center justify-start gap-2" onClick={() => router.push("/harvest")}>
                          <IconHarvest className="w-2"></IconHarvest>
                          Harvest
                        </NavigationMenuLink>

                        <NavigationMenuLink className="flex items-center justify-start gap-2">
                          <IconForum className="w-3"></IconForum>
                          Forum
                        </NavigationMenuLink>

                        <NavigationMenuLink className="flex items-center justify-start gap-2">
                          <IconSnapshot className="w-3"></IconSnapshot>
                          Snapshot
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuDropdown>
                </NavigationMenu>

                <NavigationMenu>
                  <NavigationMenuDropdown>
                    <NavigationMenuTrigger>Airdrop</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="flex w-[120px] flex-col gap-1 rounded-[10px] bg-[#070707] p-2">
                        <NavigationMenuLink className="flex items-center justify-start gap-2" onClick={() => router.push("/tasks")}>
                          <IconTask className="w-3"></IconTask>
                          Task
                        </NavigationMenuLink>

                        <NavigationMenuLink className="flex items-center justify-start gap-2" onClick={() => router.push("/referral")}>
                          <IconReferral className="w-3"></IconReferral>
                          Referral
                        </NavigationMenuLink>

                        <NavigationMenuLink className="flex items-center justify-start gap-2" onClick={() => router.push("/boosts")}>
                          <IconBoosts className="w-3"></IconBoosts>
                          Boosts
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuDropdown>
                </NavigationMenu>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex w-full items-center justify-end gap-3">
            <div className="hidden items-center justify-center rounded-[10px] bg-overlay-panel px-1 py-2.5 text-xs backdrop-blur-[60px] xl:flex">
              <span className="border-r border-white/30 px-2">TVL: $69M</span>
              <span className="flex items-center justify-center gap-1 border-r border-white/30 px-2">
                <TokenImage token="USG" size={20} />
                {formatCompact(USGCurrentSupply)}
              </span>
              <span className="flex items-center justify-center gap-1 px-2">
                <TokenImage token="sUSG" size={20} />
                {sUSGCurrentAPY.toFixed(2)}% APY
              </span>
            </div>

            <button
              onClick={() => router.push("/swap")}
              className="hidden cursor-pointer rounded-[10px] border border-button-active px-4 py-[9px] font-gilroy text-sm font-semibold hover:border-black hover:bg-button-active xl:flex"
            >
              Swap
            </button>

            <WalletConnexionContent />
          </div>
        </div>
      </div>
    </header>
  )
}
