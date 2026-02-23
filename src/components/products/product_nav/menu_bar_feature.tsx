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

import Link from "next/link"
import { cn } from "@/lib/utils"
import { useCallback } from "react"
import { usePathname } from "next/navigation"
import { useRootContext } from "../root/root_context"
import { formatCompact } from "@/lib/number_formatter"
import TokenImage from "@/components/design_system/structure/token_image"
import { SwapButton } from "@/components/design_system/inputs/swap_button"
import { WalletConnexionContent } from "../wallet/wallet_connexion_content"
import { isOnMarket, mapRouteToFeature } from "./menu_bar_feature_controller"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { IconBoosts, IconForum, IconHarvest, IconReferral, IconSnapshot, IconTangent, IconTangentLogo, IconTask } from "@/components/icons"

export default function MenuBarFeature() {
  const { USGCurrentSupply, sUSGCurrentAPY, protocolCurrentTVL } = useRootContext()

  const pathname = usePathname()

  const computedFeature = useCallback(() => {
    return mapRouteToFeature(pathname.substring(1, pathname.length))
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 flex h-[80px] w-full font-gilroy backdrop-blur-[60px]">
      <div className="mx-auto flex w-full">
        <div className="mx-2 flex w-full items-center justify-between lg:mx-4">
          <div className="flex w-full items-center justify-start gap-3">
            <div className="hidden cursor-pointer items-center gap-2 text-xl text-white md:flex">
              <Link href="/">
                <IconTangent className="mb-2 w-32"></IconTangent>
              </Link>
            </div>

            <Link className="flex cursor-pointer items-center gap-4 text-xl text-white md:hidden" href="/">
              <IconTangentLogo className="mb-2 mr-2 w-12 border-r border-white/30 px-2"></IconTangentLogo>
              {computedFeature()}
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <Link href="/">
                  <NavigationMenuItem
                    className={cn(
                      "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10",
                      isOnMarket(pathname) ? "bg-white/10 hover:bg-white/20" : ""
                    )}
                  >
                    <span className="relative z-20">Markets</span>
                  </NavigationMenuItem>
                </Link>

                <Link href="/stake">
                  <NavigationMenuItem
                    className={cn(
                      "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10",
                      pathname === "/stake" ? "bg-white/10 hover:bg-white/20" : ""
                    )}
                  >
                    <span className="relative z-20">Savings</span>
                  </NavigationMenuItem>
                </Link>

                <Link href="/earn">
                  <NavigationMenuItem
                    className={cn(
                      "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10",
                      pathname === "/earn" ? "bg-white/10 hover:bg-white/20" : ""
                    )}
                  >
                    <span className="relative z-20">Earn</span>
                  </NavigationMenuItem>
                </Link>

                <Link href="/claim">
                  <NavigationMenuItem
                    className={cn(
                      "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10",
                      pathname === "/claim" ? "bg-white/10 hover:bg-white/20" : ""
                    )}
                  >
                    <span className="relative z-20">Claim</span>
                  </NavigationMenuItem>
                </Link>

                <Link href="/dashboard">
                  <NavigationMenuItem
                    className={cn(
                      "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10",
                      pathname === "/dashboard" ? "bg-white/10 hover:bg-white/20" : ""
                    )}
                  >
                    <span className="relative z-20">Dashboard</span>
                  </NavigationMenuItem>
                </Link>

                <NavigationMenu>
                  <NavigationMenuDropdown>
                    <NavigationMenuTrigger>DAO</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="flex w-[120px] flex-col gap-1 rounded-[10px] border border-white/10 bg-dark p-2">
                        <NavigationMenuLink asChild>
                          <Link href="/harvest" className="flex items-center justify-start gap-2">
                            <IconHarvest className="w-2" />
                            Harvest
                          </Link>
                        </NavigationMenuLink>

                        <NavigationMenuLink asChild>
                          <Link href="/forum" className="flex items-center justify-start gap-2">
                            <IconForum className="w-3" />
                            Forum
                          </Link>
                        </NavigationMenuLink>

                        <NavigationMenuLink asChild>
                          <Link href="/snapshot" className="flex items-center justify-start gap-2">
                            <IconSnapshot className="w-3" />
                            Snapshot
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuDropdown>
                </NavigationMenu>

                <NavigationMenu>
                  <NavigationMenuDropdown>
                    <NavigationMenuTrigger>Airdrop</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="flex w-[120px] flex-col gap-1 rounded-[10px] border border-white/10 bg-dark p-2">
                        <NavigationMenuLink asChild>
                          <Link href="/tasks" className="flex items-center justify-start gap-2">
                            <IconTask className="w-3" />
                            Tasks
                          </Link>
                        </NavigationMenuLink>

                        <NavigationMenuLink asChild>
                          <Link href="/referral" className="flex items-center justify-start gap-2">
                            <IconReferral className="w-3" />
                            Referral
                          </Link>
                        </NavigationMenuLink>

                        <NavigationMenuLink asChild>
                          <Link href="/boosts" className="flex items-center justify-start gap-2">
                            <IconBoosts className="w-3" />
                            Boosts
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuDropdown>
                </NavigationMenu>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex w-full items-center justify-end gap-3">
            <ReliefCard className="hidden items-center justify-center px-1 py-2.5 text-xs xl:flex">
              <span className="border-r border-white/30 px-2">TVL: ${formatCompact(protocolCurrentTVL?.total)} </span>
              <span className="flex items-center justify-center gap-2 border-r border-white/30 px-2">
                <TokenImage token="USG" size={20} />
                {formatCompact(USGCurrentSupply)}
              </span>
              <span className="flex items-center justify-center gap-2 px-2">
                <TokenImage token="sUSG" size={20} />
                {sUSGCurrentAPY.toFixed(2)}% APY
              </span>
            </ReliefCard>

            <SwapButton />

            <WalletConnexionContent />
          </div>
        </div>
      </div>
    </header>
  )
}
