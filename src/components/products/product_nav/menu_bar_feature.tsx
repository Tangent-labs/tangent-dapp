"use client"

import { useRouter } from "next/navigation"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import { Logo } from "@/components/design_system/structure/logo"
import DropdownMenu from "@/components/design_system/structure/dropdown_menu"

export default function MenuBarFeature() {
  const router = useRouter()

  return (
    <div className="flex h-16 items-center justify-center gap-6">
      <div onClick={() => router.push("/")} className="flex cursor-pointer items-center justify-start gap-2 text-lg font-bold">
        <Logo />
        Tangent
      </div>

      <PanelRaw className="flex w-fit items-center justify-between gap-12 px-6 py-2">
        <div className="flex cursor-pointer justify-center gap-2">
          <DropdownMenu label="Dashboard">
            <div className="flex flex-col items-start justify-start gap-2">
              <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic" onClick={() => router.push("/protocol")}>
                Protocol
              </div>
              <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic" onClick={() => router.push("/user")}>
                User
              </div>
            </div>
          </DropdownMenu>
        </div>

        <div className="flex cursor-pointer justify-center gap-5">
          <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p onClick={() => router.push("/")} className="cursor-pointer text-sm aria-disabled:text-gray-700">
              Market
            </p>
          </div>
        </div>

        <div className="flex cursor-pointer justify-center gap-5">
          <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p onClick={() => router.push("/stake")} className="cursor-pointer text-sm aria-disabled:text-gray-700">
              Stake
            </p>
          </div>
        </div>

        <div className="flex cursor-pointer justify-center gap-5">
          <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p onClick={() => router.push("/swap")} className="cursor-pointer text-sm aria-disabled:text-gray-700">
              Swap
            </p>
          </div>
        </div>

        <div className="flex cursor-pointer justify-center gap-5">
          <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p onClick={() => router.push("/earn")} className="cursor-pointer text-sm aria-disabled:text-gray-700">
              Earn
            </p>
          </div>
        </div>

        <div className="flex cursor-pointer justify-center gap-2">
          <DropdownMenu label="Manage">
            <div className="flex flex-col items-start justify-start gap-2">
              <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic" onClick={() => router.push("/claim")}>
                Claim
              </div>
              <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic" onClick={() => router.push("/harvest")}>
                Harvest
              </div>
            </div>
          </DropdownMenu>
        </div>

        <div className="flex cursor-pointer justify-center gap-2">
          <DropdownMenu label="Tan">
            <div className="flex flex-col items-start justify-start gap-2">
              <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic" onClick={() => router.push("/tan/lock")}>
                Lock
              </div>
              <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic" onClick={() => router.push("/stan")}>
                Stake
              </div>
            </div>
          </DropdownMenu>
        </div>

        <div className="flex cursor-pointer justify-center gap-2">
          <DropdownMenu label="Airdrop">
            <div className="flex flex-col items-start justify-start gap-2">
              <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic" onClick={() => router.push("/airdrop")}>
                Task
              </div>
              <div
                className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic"
                onClick={() => router.push("/airdrop/referral")}
              >
                Referral
              </div>
              <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic" onClick={() => router.push("/airdrop/pass")}>
                Tangium pass
              </div>
            </div>
          </DropdownMenu>
        </div>
      </PanelRaw>
    </div>
  )
}
