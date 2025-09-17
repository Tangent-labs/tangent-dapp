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
import { Button } from "@/components/design_system/inputs/button"
import { WalletConnexionContent } from "../wallet/wallet_connexion_content"

export default function MenuBarFeature() {
  const router = useRouter()

  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 flex h-[80px] w-full font-roobert backdrop-blur-[60px]">
      <div className="container mx-auto flex w-full">
        <div className="mx-4 flex w-full items-center justify-between">
          <div onClick={() => router.push("/")} className="flex cursor-pointer items-center gap-2 text-[20px] text-white">
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
                Stake
              </NavigationMenuItem>
              <NavigationMenuItem className={pathname === "/swap" ? "bg-tab bg-clip-text font-bold text-transparent" : ""} onClick={() => router.push("/swap")}>
                Swap
              </NavigationMenuItem>
              <NavigationMenuItem className={pathname === "/earn" ? "bg-tab bg-clip-text font-bold text-transparent" : ""} onClick={() => router.push("/earn")}>
                Earn
              </NavigationMenuItem>
              <NavigationMenu>
                <NavigationMenuDropdown>
                  <NavigationMenuTrigger>Manage</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="flex w-[120px] flex-col gap-1 rounded-[10px] bg-[#070707] p-2">
                      <NavigationMenuLink onClick={() => router.push("/claim")}>Claim</NavigationMenuLink>
                      <NavigationMenuLink onClick={() => router.push("/harvest")}>Harvest</NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuDropdown>
              </NavigationMenu>

              <NavigationMenu>
                <NavigationMenuDropdown>
                  <NavigationMenuTrigger>TAN</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="flex w-[120px] flex-col gap-1 rounded-[10px] bg-[#070707] p-2">
                      <NavigationMenuLink onClick={() => router.push("/tan/lock")}>Lock</NavigationMenuLink>
                      <NavigationMenuLink onClick={() => router.push("/stan")}>Stake</NavigationMenuLink>
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

            <Button onClick={() => router.push("/swap")} className="ml-4 hidden h-10 !px-8 font-roobert font-semibold text-white xl:flex">
              Buy USG
            </Button>
          </NavigationMenu>

          <WalletConnexionContent />
        </div>
      </div>
    </header>
  )
}
