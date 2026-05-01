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
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useRootContext } from "../root/root_context"
import { useScrollDirection } from "@/lib/animations"
import { formatMillions } from "@/lib/number_formatter"
import { isOnMarket } from "./menu_bar_feature_controller"
import { SwapButton } from "@/components/design_system/inputs/swap_button"
import { WalletConnexionContent } from "../wallet/wallet_connexion_content"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { IconBoosts, IconForum, IconHarvest, IconReferral, IconSnapshot, IconTangent, IconTangentLogo, IconTask } from "@/components/icons"

export default function MenuBarFeature() {
  const { USGCurrentSupply, sUSGCurrentAPY, protocolCurrentTVL } = useRootContext()

  const isHeaderVisible = useScrollDirection()

  const pathname = usePathname()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  //  Hide and display navbar on scroll
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.top = `-${window.scrollY}px`
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
      window.scrollTo(0, parseInt(scrollY || "0") * -1)
    }
    return () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
    }
  }, [mobileMenuOpen])

  const routesMenuItem = [
    { route: "/", label: "Markets", condition: (path: string) => isOnMarket(path) },
    { route: "/stake", label: "Savings" },
    { route: "/earn", label: "Earn" },
    { route: "/claim", label: "Claim" },
    { route: "/dashboard", label: "Dashboard" },
    { route: "/swap", label: "Swap", mobileOnly: true },
  ]

  const routesDropdown = [
    {
      baseLabel: "DAO",
      routes: [
        { route: "https://snapshot.box/#/s:tangent-finance.eth", label: "Snapshot", logo: <IconSnapshot className="w-4" />, external: true },
        { route: "https://tangentfinance.discourse.group/categories", label: "Forum", logo: <IconForum className="w-4" />, external: true },
        { route: "/harvest", label: "Harvest", logo: <IconHarvest className="w-3" /> },
      ],
    },
    {
      baseLabel: "Airdrop",
      routes: [
        { route: "/tasks", label: "Tasks", logo: <IconTask className="w-4" /> },
        { route: "/referral", label: "Referral", logo: <IconReferral className="w-4" /> },
        { route: "/boosts", label: "Boosts", logo: <IconBoosts className="w-4" /> },
      ],
    },
  ]

  const getCurrentLabel = () => {
    const menuItem = routesMenuItem.find((r) => (r.condition ? r.condition(pathname) : pathname === r.route))
    if (menuItem) return menuItem.label
    for (const dropdown of routesDropdown) {
      const match = dropdown.routes.find((r) => r.route === pathname)
      if (match) return match.label
    }
    return null
  }

  const currentLabel = getCurrentLabel()

  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [])
  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-50 mb-4 flex w-full py-2 font-gilroy backdrop-blur-[60px]",
          "transition-transform duration-300 ease-out",
          isHeaderVisible || mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="mx-auto flex w-full">
          <div className="mx-2 flex w-full items-center justify-between lg:mx-4">
            <div className="flex w-full items-center justify-start gap-3">
              <div className="flex cursor-pointer items-center gap-2 text-xl text-white">
                <Link href="/">
                  <IconTangent className="mb-1 hidden w-24 transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] md-lg:mb-2 md-lg:block" />
                  <IconTangentLogo className="mb-1 transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] md-lg:hidden" />
                </Link>
                {currentLabel && (
                  <div className="flex items-center gap-2 md-lg:hidden">
                    <div className="h-8 w-px bg-white/20" />
                    <span className="font-gilroy text-xl font-normal leading-none tracking-normal text-white">{currentLabel}</span>
                  </div>
                )}
              </div>

              {/* Desktop navigation */}
              <NavigationMenu>
                <NavigationMenuList>
                  {routesMenuItem
                    .filter((r) => !r.mobileOnly)
                    .map((route) => {
                      return (
                        <Link key={route.route} href={route.route} rel="noopener noreferrer" className="group/link relative pb-1">
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
                                  <Link
                                    href={route.route}
                                    target={route.external ? "_blank" : ""}
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-start gap-2"
                                  >
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
              <ReliefCard className="hidden items-center justify-center px-1 py-2.5 text-xs xl:flex">
                <span className="border-r border-white/10 px-2">TVL: ${formatMillions(protocolCurrentTVL?.total)}</span>
                <span className="flex items-center justify-center gap-2 border-r border-white/10 px-2">
                  <TokenImage token="USG" size={20} />
                  {formatMillions(USGCurrentSupply)}
                </span>
                <span className="flex items-center justify-center gap-2 px-2">
                  <TokenImage token="sUSG" size={20} />
                  {sUSGCurrentAPY.toFixed(2)}% APY
                </span>
              </ReliefCard>

              <SwapButton />

              <WalletConnexionContent />

              {/* Burger button - mobile only */}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="relative z-[60] flex h-9 w-9 flex-col items-center justify-center gap-[6px] rounded-lg md-lg:hidden"
                aria-label="Toggle menu"
              >
                <span
                  className={cn("h-[2px] w-5 rounded-full bg-white transition-all duration-300 ease-out", mobileMenuOpen && "translate-y-[8px] rotate-45")}
                />
                <span className={cn("h-[2px] w-5 rounded-full bg-white transition-all duration-300 ease-out", mobileMenuOpen && "opacity-0")} />
                <span
                  className={cn("h-[2px] w-5 rounded-full bg-white transition-all duration-300 ease-out", mobileMenuOpen && "-translate-y-[8px] -rotate-45")}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile menu panel */}
      <>
        {/* Mobile menu */}
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 z-40 flex flex-col overflow-hidden border-b border-white/10 bg-dark font-gilroy transition-all duration-300 ease-out md-lg:hidden",
            mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          style={{ top: `${headerHeight}px` }}
        >
          <div className="flex flex-col overflow-y-auto px-4 pb-6 pt-4">
            {routesMenuItem.map((route) => {
              const isActive = route.condition ? route.condition(pathname) : pathname === route.route
              return (
                <Link
                  key={route.route}
                  href={route.route}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center border-b border-white/5 py-4 text-base font-semibold transition-colors",
                    isActive ? "text-white" : "text-white/50"
                  )}
                >
                  {isActive && <span className="mr-3 h-4 w-[2px] rounded-full bg-gradient-to-b from-[--tgt-row-tonic] to-blue-600" />}
                  {route.label}
                </Link>
              )
            })}

            {routesDropdown.map((dropdown) => (
              <div key={dropdown.baseLabel} className="mt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/30">{dropdown.baseLabel}</span>
                <div className="mt-2 flex flex-col">
                  {dropdown.routes.map((route) => {
                    const isActive = pathname === route.route
                    return (
                      <Link
                        key={route.route}
                        href={route.route}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 border-b border-white/5 py-3 text-base font-semibold transition-colors",
                          isActive ? "text-white" : "text-white/50"
                        )}
                      >
                        {isActive && <span className="h-4 w-[2px] rounded-full bg-gradient-to-b from-[--tgt-row-tonic] to-blue-600" />}
                        <span className="flex w-4 items-center justify-center">{route.logo}</span>
                        {route.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    </>
  )
}
