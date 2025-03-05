"use client"

import { useRouter } from "next/navigation"
import PanelRaw from "@/components/design_system/structure/panel_raw"
import { Logo } from "@/components/design_system/structure/logo"

export default function MenuBarFeature() {
  const router = useRouter()

  return (
    <div className="flex h-16 items-center justify-center gap-6">
      <div onClick={() => router.push("/")} className="flex cursor-pointer items-center justify-start gap-2 text-lg font-bold">
        <Logo />
        Tangent
      </div>

      <PanelRaw className="flex w-fit items-center justify-between gap-12 px-6 py-2">
        <div className="flex cursor-pointer justify-center gap-5 md:gap-10">
          <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p onClick={() => router.push("/dashboard")} className="cursor-pointer text-sm aria-disabled:text-gray-700">
              Dashboard
            </p>
          </div>
        </div>

        <div className="flex cursor-pointer justify-center gap-5 md:gap-10">
          <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p onClick={() => router.push("/")} className="cursor-pointer text-sm aria-disabled:text-gray-700">
              Markets
            </p>
          </div>
        </div>

        <div className="flex cursor-pointer justify-center gap-5 md:gap-10">
          <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p onClick={() => router.push("/stake")} className="cursor-pointer text-sm aria-disabled:text-gray-700">
              Stake
            </p>
          </div>
        </div>

        <div className="flex cursor-pointer justify-center gap-5 md:gap-10">
          <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p onClick={() => router.push("/earn")} className="cursor-pointer text-sm aria-disabled:text-gray-700">
              Earn
            </p>
          </div>
        </div>

        <div className="flex cursor-pointer justify-center gap-5 md:gap-10">
          <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p onClick={() => router.push("/airdrop")} className="cursor-pointer text-sm aria-disabled:text-gray-700">
              Airdrop
            </p>
          </div>
        </div>

        <div className="flex cursor-pointer justify-center gap-5 md:gap-10">
          <div className="transition-all duration-700 hover:text-row-tonic data-[active=true]:text-row-tonic">
            <p onClick={() => router.push("/buy")} className="cursor-pointer text-sm aria-disabled:text-gray-700">
              Buy
            </p>
          </div>
        </div>
      </PanelRaw>
    </div>
  )
}
