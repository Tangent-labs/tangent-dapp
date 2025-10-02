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
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/design_system/structure/logo"
import { WalletConnexionContent } from "../wallet/wallet_connexion_content"
import TokenImage from "@/components/design_system/structure/token_image"

export default function MenuBarFeature() {
  const router = useRouter()

  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 flex h-[80px] w-full font-roobert backdrop-blur-[60px]">
      <div className="usg-container mx-auto flex w-full px-0 md:px-4">
        <div className="mx-4 flex w-full items-center justify-between">
          <div className="flex w-full items-center justify-start gap-3">
            <div onClick={() => router.push("/")} className="flex cursor-pointer items-center gap-2 text-xl text-white">
              <Logo />
              Tangent
            </div>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem
                  className={pathname === "/dashboard" ? "bg-tab bg-clip-text font-bold text-transparent" : ""}
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </NavigationMenuItem>
                <NavigationMenuItem className={pathname === "/" ? "bg-tab bg-clip-text font-bold text-transparent" : ""} onClick={() => router.push("/")}>
                  Markets
                </NavigationMenuItem>
                <NavigationMenuItem
                  className={pathname === "/stake" ? "bg-tab bg-clip-text font-bold text-transparent" : ""}
                  onClick={() => router.push("/stake")}
                >
                  Savings
                </NavigationMenuItem>

                <NavigationMenuItem
                  className={pathname === "/earn" ? "bg-tab bg-clip-text font-bold text-transparent" : ""}
                  onClick={() => router.push("/earn")}
                >
                  Earn
                </NavigationMenuItem>

                <NavigationMenuItem
                  className={pathname === "/claim" ? "bg-tab bg-clip-text font-bold text-transparent" : ""}
                  onClick={() => router.push("/claim")}
                >
                  Claim
                </NavigationMenuItem>

                <NavigationMenu>
                  <NavigationMenuDropdown>
                    <NavigationMenuTrigger>DAO</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="flex w-[120px] flex-col gap-1 rounded-[10px] bg-[#070707] p-2">
                        <NavigationMenuLink onClick={() => router.push("/harvest")}>Harvest</NavigationMenuLink>
                        <NavigationMenuLink>Forum</NavigationMenuLink>
                        <NavigationMenuLink>Snapshot</NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuDropdown>
                </NavigationMenu>

                <NavigationMenu>
                  <NavigationMenuDropdown>
                    <NavigationMenuTrigger>Airdrop</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="flex w-[120px] flex-col gap-1 rounded-[10px] bg-[#070707] p-2">
                        <NavigationMenuLink onClick={() => router.push("/tasks")}>Task</NavigationMenuLink>
                        <NavigationMenuLink onClick={() => router.push("/referral")}>Referral</NavigationMenuLink>
                        <NavigationMenuLink onClick={() => router.push("/boosts")}>Boosts</NavigationMenuLink>
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
                $3.12M
              </span>
              <span className="flex items-center justify-center gap-1 px-2">
                <TokenImage token="sUSG" size={20} />
                10.3% APY
              </span>
            </div>

            <button
              onClick={() => router.push("/swap")}
              className="gradient-border-btn hidden cursor-pointer px-4 py-2.5 font-roobert text-sm font-semibold xl:flex"
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
