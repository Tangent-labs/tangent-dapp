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
import { useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { useRootContext } from "../root/root_context"
import { formatCompact } from "@/lib/number_formatter"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { WalletConnexionContent } from "../wallet/wallet_connexion_content"
import { isOnMarket, mapRouteToFeature } from "./menu_bar_feature_controller"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { SwapButton } from "@/components/design_system/inputs/swap_button"
import { IconBoosts, IconForum, IconHarvest, IconReferral, IconSnapshot, IconTangent, IconTangentLogo, IconTask } from "@/components/icons"
import { useScrollDirection } from "@/lib/animations"

export default function MenuBarFeature() {
  const { USGCurrentSupply, sUSGCurrentAPY, protocolCurrentTVL } = useRootContext()
  const isHeaderVisible = useScrollDirection()
  const pathname = usePathname()

  const computedFeature = useCallback(() => {
    return mapRouteToFeature(pathname.substring(1, pathname.length))
  }, [pathname])

  const routesMenuItem = [
    { route: "/", label: "Markets", condition: (path: string) => isOnMarket(path) },
    { route: "/stake", label: "Savings" },
    { route: "/earn", label: "Earn" },
    { route: "/claim", label: "Claim" },
    { route: "/dashboard", label: "Dashboard" },
  ]

  const routesDropdown = [
    {
      baseLabel: "DAO",
      routes: [
        { route: "/snapshot", label: "Snapshot", logo: <IconSnapshot className="w-3" /> },
        { route: "/forum", label: "Forum", logo: <IconForum className="w-3" /> },
        { route: "/harvest", label: "Harvest", logo: <IconHarvest className="w-2" /> },
      ],
    },

    {
      baseLabel: "Airdrop",
      routes: [
        { route: "/tasks", label: "Tasks", logo: <IconTask className="w-2" /> },
        { route: "/referral", label: "Referral", logo: <IconReferral className="w-3" /> },
        { route: "/boosts", label: "Boosts", logo: <IconBoosts className="w-3" /> },
      ],
    },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mb-4 flex w-full pt-1 font-gilroy backdrop-blur-[60px]",
        "transition-transform duration-300 ease-out",
        isHeaderVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="mx-auto flex w-full">
        <div className="mx-2 flex w-full items-center justify-between lg:mx-4">
          <div className="flex w-full items-center justify-start gap-3">
            <div className="hidden cursor-pointer items-center gap-2 text-xl text-white md:flex">
              <Link href="/">
                <IconTangent className="mb-2 w-24 transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]" />{" "}
              </Link>
            </div>

            <Link className="flex cursor-pointer items-center gap-4 text-xl text-white md:hidden" href="/">
              <IconTangentLogo className="mb-2 mr-2 w-12 border-r border-white/30 px-2"></IconTangentLogo>
              {computedFeature()}
            </Link>

            <NavigationMenu>
              {/* LINKS WITHOUT DROPDOWN */}
              <NavigationMenuList>
                {routesMenuItem.map((route) => {
                  const ref = useRef(null)

                  return (
                    <Link ref={ref} key={route.route} href={route.route} className="group/link relative pb-1">
                      <NavigationMenuItem
                        className={cn(
                          "relative z-10 rounded-lg px-4 py-2 text-sm font-semibold text-[--tgt-subtitle] transition-colors hover:bg-white/10",
                          "active:scale-[0.97]",
                          (route.condition ? route.condition(pathname) : pathname === route.route) ? "text-white" : ""
                        )}
                      >
                        <span className="relative z-20">{route.label}</span>
                      </NavigationMenuItem>
                      <span
                        className={cn(
                          "absolute bottom-0 left-0 z-20 h-[2px] w-full bg-gradient-to-r from-[--tgt-row-tonic] to-blue-600 transition-transform duration-300 ease-out",
                          (route.condition ? route.condition(pathname) : pathname === route.route)
                            ? "origin-left scale-x-100"
                            : "origin-left scale-x-0 group-hover/link:origin-left group-hover/link:scale-x-100"
                        )}
                      />
                    </Link>
                  )
                })}

                {/* LINKS WITH DROPDOWN */}

                {routesDropdown.map((dropdown) => {
                  const route = dropdown.routes.find((r) => r.route === pathname)
                  const isSelected = route ? true : false

                  return (
                    <NavigationMenu viewport={false} key={dropdown.baseLabel} delayDuration={150}>
                      <NavigationMenuDropdown>
                        <NavigationMenuTrigger className="active:scale-[0.97]" isSelected={isSelected}>
                          {dropdown.baseLabel}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="flex w-[120px] flex-col gap-1 rounded-[10px] border border-white/10 bg-dark p-2">
                            {dropdown.routes.map((route) => (
                              <NavigationMenuLink key={route.label} asChild>
                                <Link href={route.route} className="flex items-center justify-start gap-2">
                                  {route.logo}
                                  {route.label}
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuDropdown>
                    </NavigationMenu>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex w-full items-center justify-end gap-3">
            <ReliefCard className="hidden items-center justify-center px-1 py-1.5 text-xs xl:flex">
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

            <WalletConnexionContent classNameChild={"py-[5px] px-1"} />
          </div>
        </div>
      </div>
    </header>
  )
}
