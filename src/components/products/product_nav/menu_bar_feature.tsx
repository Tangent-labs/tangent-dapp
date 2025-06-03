"use client"

import { useRouter } from "next/navigation"
import { Logo } from "@/components/design_system/structure/logo"
import DropdownMenu from "@/components/design_system/structure/dropdown_menu"
import { Button } from "@/components/design_system/inputs/button"
import { WalletConnexionButton } from "@/components/products/wallet/Wallet_connexion_button"

export default function MenuBarFeature() {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full backdrop-blur-[60px]">
      <div className="container mx-auto flex w-full items-center justify-between">
        <div onClick={() => router.push("/")} className="flex cursor-pointer items-center gap-2 text-[20px] text-white">
          <Logo />
          Tangent
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <nav className="flex items-center gap-4 md:gap-10">
            <div className="flex cursor-pointer items-center">
              <DropdownMenu label="Dashboard">
                <div className="flex flex-col items-start gap-2 p-2">
                  <div className="transition-colors duration-300 hover:text-blue-400 data-[active=true]:text-blue-400" onClick={() => router.push("/protocol")}>
                    Protocol
                  </div>
                  <div className="transition-colors duration-300 hover:text-blue-400 data-[active=true]:text-blue-400" onClick={() => router.push("/user")}>
                    User
                  </div>
                </div>
              </DropdownMenu>
            </div>

            <div className="flex cursor-pointer items-center">
              <p onClick={() => router.push("/")} className="text-sm text-white transition-colors duration-300 hover:text-blue-400 aria-disabled:text-gray-500">
                Market
              </p>
            </div>

            <div className="flex cursor-pointer items-center">
              <p
                onClick={() => router.push("/stake")}
                className="text-sm text-white transition-colors duration-300 hover:text-blue-400 aria-disabled:text-gray-500"
              >
                Stake
              </p>
            </div>

            <div className="flex cursor-pointer items-center">
              <p
                onClick={() => router.push("/swap")}
                className="text-sm text-white transition-colors duration-300 hover:text-blue-400 aria-disabled:text-gray-500"
              >
                Swap
              </p>
            </div>

            <div className="flex cursor-pointer items-center">
              <p
                onClick={() => router.push("/earn")}
                className="text-sm text-white transition-colors duration-300 hover:text-blue-400 aria-disabled:text-gray-500"
              >
                Earn
              </p>
            </div>

            <div className="flex cursor-pointer items-center">
              <DropdownMenu label="Manage">
                <div className="flex flex-col items-start gap-2 p-2">
                  <div className="transition-colors duration-300 hover:text-blue-400 data-[active=true]:text-blue-400" onClick={() => router.push("/claim")}>
                    Claim
                  </div>
                  <div className="transition-colors duration-300 hover:text-blue-400 data-[active=true]:text-blue-400" onClick={() => router.push("/harvest")}>
                    Harvest
                  </div>
                </div>
              </DropdownMenu>
            </div>

            <div className="flex cursor-pointer items-center">
              <DropdownMenu label="Tan">
                <div className="flex flex-col items-start gap-2 p-2">
                  <div className="transition-colors duration-300 hover:text-blue-400 data-[active=true]:text-blue-400" onClick={() => router.push("/tan/lock")}>
                    Lock
                  </div>
                  <div className="transition-colors duration-300 hover:text-blue-400 data-[active=true]:text-blue-400" onClick={() => router.push("/stan")}>
                    Stake
                  </div>
                </div>
              </DropdownMenu>
            </div>

            <div className="flex cursor-pointer items-center">
              <DropdownMenu label="Airdrop">
                <div className="flex flex-col items-start gap-2 p-2">
                  <div className="transition-colors duration-300 hover:text-blue-400 data-[active=true]:text-blue-400" onClick={() => router.push("/airdrop")}>
                    Task
                  </div>
                  <div
                    className="transition-colors duration-300 hover:text-blue-400 data-[active=true]:text-blue-400"
                    onClick={() => router.push("/airdrop/referral")}
                  >
                    Referral
                  </div>
                  <div
                    className="transition-colors duration-300 hover:text-blue-400 data-[active=true]:text-blue-400"
                    onClick={() => router.push("/airdrop/pass")}
                  >
                    Tangium pass
                  </div>
                </div>
              </DropdownMenu>
            </div>
          </nav>
          <Button className="h-10 font-bold text-white">Buy tgUSD</Button>
        </div>

        <div className="flex items-center gap-3">
          <WalletConnexionButton />
        </div>
      </div>
    </header>
  )
}
