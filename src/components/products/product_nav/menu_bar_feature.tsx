"use client"

import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/design_system/structure/logo"
import DropdownMenu from "@/components/design_system/structure/dropdown_menu"
import { Button } from "@/components/design_system/inputs/button"
import { WalletConnexionButton } from "@/components/products/wallet/Wallet_connexion_button"
import { cn } from "@/lib/utils"

export default function MenuBarFeature() {
  const router = useRouter()

  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 flex h-[80px] w-full font-roobert backdrop-blur-[60px]">
      <div className="container mx-auto flex w-full items-center justify-between">
        <div onClick={() => router.push("/")} className="flex cursor-pointer items-center gap-2 text-[20px] text-white">
          <Logo />
          Tangent
        </div>

        <div className="flex items-center gap-4 font-roobert md:gap-6">
          <nav className="flex items-center gap-10">
            <div className="flex cursor-pointer items-center">
              <p
                onClick={() => router.push("/dashboard")}
                className={cn(
                  "text-sm font-semibold text-white transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-transparent aria-disabled:text-gray-500",
                  pathname === "/dashboard" ? "bg-tab bg-clip-text font-bold text-transparent" : ""
                )}
              >
                Dashboard
              </p>
            </div>

            <div className="flex cursor-pointer items-center">
              <p
                onClick={() => router.push("/")}
                className={cn(
                  "text-sm font-semibold text-white transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-transparent aria-disabled:text-gray-500",
                  pathname === "/" ? "bg-tab bg-clip-text font-bold text-transparent" : ""
                )}
              >
                Markets
              </p>
            </div>

            <div className="flex cursor-pointer items-center">
              <p
                onClick={() => router.push("/stake")}
                className={cn(
                  "text-sm font-semibold text-white transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-transparent aria-disabled:text-gray-500",
                  pathname === "/stake" ? "bg-tab bg-clip-text font-bold text-transparent" : ""
                )}
              >
                Stake
              </p>
            </div>

            <div className="flex cursor-pointer items-center">
              <p
                onClick={() => router.push("/swap")}
                className={cn(
                  "text-sm font-semibold text-white transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-transparent aria-disabled:text-gray-500",
                  pathname === "/swap" ? "bg-tab bg-clip-text font-bold text-transparent" : ""
                )}
              >
                Swap
              </p>
            </div>

            <div className="flex cursor-pointer items-center">
              <p
                onClick={() => router.push("/earn")}
                className={cn(
                  "text-sm font-semibold text-white transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-transparent aria-disabled:text-gray-500",
                  pathname === "/earn" ? "bg-tab bg-clip-text font-bold text-transparent" : ""
                )}
              >
                Earn
              </p>
            </div>

            <div className="flex cursor-pointer items-center">
              <DropdownMenu label="Manage">
                <div className="flex flex-col items-start gap-2 p-2">
                  <div
                    className="font-semibold transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-blue-400 hover:text-transparent data-[active=true]:text-blue-400"
                    onClick={() => router.push("/claim")}
                  >
                    Claim
                  </div>
                  <div
                    className="font-semibold transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-blue-400 hover:text-transparent data-[active=true]:text-blue-400"
                    onClick={() => router.push("/harvest")}
                  >
                    Harvest
                  </div>
                </div>
              </DropdownMenu>
            </div>

            <div className="flex cursor-pointer items-center">
              <DropdownMenu pathname={pathname} label="Tan">
                <div className="flex flex-col items-start gap-2 p-2">
                  <div
                    className="font-semibold transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-blue-400 hover:text-transparent data-[active=true]:text-blue-400"
                    onClick={() => router.push("/tan/lock")}
                  >
                    Lock
                  </div>
                  <div
                    className="font-semibold transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-blue-400 hover:text-transparent data-[active=true]:text-blue-400"
                    onClick={() => router.push("/stan")}
                  >
                    Stake
                  </div>
                </div>
              </DropdownMenu>
            </div>

            <div className="flex cursor-pointer items-center">
              <DropdownMenu label="Airdrop">
                <div className="flex flex-col items-start gap-2 p-2">
                  <div
                    className="font-semibold transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-blue-400 hover:text-transparent data-[active=true]:text-blue-400"
                    onClick={() => router.push("/airdrop")}
                  >
                    Task
                  </div>
                  <div
                    className="font-semibold transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-blue-400 hover:text-transparent data-[active=true]:text-blue-400"
                    onClick={() => router.push("/airdrop/referral")}
                  >
                    Referral
                  </div>
                  <div
                    className="font-semibold transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-blue-400 hover:text-transparent data-[active=true]:text-blue-400"
                    onClick={() => router.push("/airdrop/pass")}
                  >
                    Tangium pass
                  </div>
                </div>
              </DropdownMenu>
            </div>
          </nav>
          <Button className="h-10 !px-8 font-roobert font-semibold text-white">Buy USG</Button>
        </div>

        <WalletConnexionButton />
      </div>
    </header>
  )
}
