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

import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { motion } from "framer-motion"
import { useRootContext } from "../root/root_context"
import { formatCompact } from "@/lib/number_formatter"
import { usePathname, useRouter } from "next/navigation"
import { mapRouteToFeature } from "./menu_bar_feature_controller"
import TokenImage from "@/components/design_system/structure/token_image"
import { WalletConnexionContent } from "../wallet/wallet_connexion_content"
import { IconBoosts, IconForum, IconHarvest, IconReferral, IconSnapshot, IconTangent, IconTangentLogo, IconTask } from "@/components/icons"

export default function MenuBarFeature() {
  const { USGCurrentSupply, sUSGCurrentAPY } = useRootContext()

  const router = useRouter()

  const pathname = usePathname()

  const computedFeature = useCallback(() => {
    return mapRouteToFeature(pathname.substring(1, pathname.length))
  }, [pathname])

  const MotionDiv = () => {
    return (
      <motion.div
        layoutId="header-menu-motion-div"
        className="absolute inset-0 rounded-lg bg-white/10"
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 30,
        }}
      />
    )
  }

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
                  onClick={() => router.push("/dashboard")}
                  className={cn(
                    "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10",
                    pathname === "/dashboard" ? "" : "hover:bg-white/20"
                  )}
                >
                  {pathname === "/dashboard" && <MotionDiv></MotionDiv>}
                  <span className="relative z-20">Dashboard</span>
                </NavigationMenuItem>

                <NavigationMenuItem
                  onClick={() => router.push("/")}
                  className={cn(
                    "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10",
                    pathname === "/" ? "" : "hover:bg-white/20"
                  )}
                >
                  {pathname === "/" && <MotionDiv></MotionDiv>}
                  <span className="relative z-20">Markets</span>
                </NavigationMenuItem>
                <NavigationMenuItem
                  onClick={() => router.push("/stake")}
                  className={cn(
                    "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10",
                    pathname === "/stake" ? "" : "hover:bg-white/20"
                  )}
                >
                  {pathname === "/stake" && <MotionDiv></MotionDiv>}
                  <span className="relative z-20">Savings</span>
                </NavigationMenuItem>

                <NavigationMenuItem
                  onClick={() => router.push("/earn")}
                  className={cn(
                    "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10",
                    pathname === "/earn" ? "" : "hover:bg-white/20"
                  )}
                >
                  {pathname === "/earn" && <MotionDiv></MotionDiv>}
                  <span className="relative z-20">Earn</span>
                </NavigationMenuItem>

                <NavigationMenuItem
                  onClick={() => router.push("/claim")}
                  className={cn(
                    "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10",
                    pathname === "/claim" ? "hover:bg-white/20" : "hover:bg-white/10"
                  )}
                >
                  {pathname === "/claim" && <MotionDiv></MotionDiv>}
                  <span className="relative z-20">Claim</span>
                </NavigationMenuItem>

                <NavigationMenu>
                  <NavigationMenuDropdown>
                    <NavigationMenuTrigger>DAO</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="flex w-[120px] flex-col gap-1 rounded-[10px] bg-dark p-2">
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
                      <div className="flex w-[120px] flex-col gap-1 rounded-[10px] bg-dark p-2">
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
