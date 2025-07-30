"use client"

import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { useMemo } from "react"

export const MenuModal = () => {
  const pathname = usePathname()
  const router = useRouter()

  const featureDisplayed = useMemo(() => {
    const feat = pathname.substring(1, pathname.length)

    if (feat === "") {
      return "Markets"
    }

    return feat.substring(0, 1).toUpperCase() + feat.substring(1, feat.length).toLowerCase()
  }, [pathname])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="rounded-[10px] border border-white border-opacity-20 bg-button-active bg-clip-text px-3 py-2 text-[14px] font-semibold text-transparent">
          {featureDisplayed}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#1A1A1A] text-white">
        <div className="flex flex-col space-y-2">
          <h3 className="mb-2 text-lg font-semibold">Menu</h3>
          <DialogClose asChild>
            <button
              className={cn(
                "flex items-center justify-center rounded-[10px] border border-white border-opacity-20 px-4 py-2 font-roobert text-[15px] font-semibold",
                pathname === "/" ? "bg-button-active text-black" : "text-white"
              )}
              onClick={() => router.push("/")}
            >
              Markets
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              className={cn(
                "flex items-center justify-center rounded-[10px] border border-white border-opacity-20 px-4 py-2 font-roobert text-[15px] font-semibold",
                pathname === "/stake" ? "bg-button-active text-black" : "text-white"
              )}
              onClick={() => router.push("/stake")}
            >
              Stake
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              className={cn(
                "flex items-center justify-center rounded-[10px] border border-white border-opacity-20 px-4 py-2 font-roobert text-[15px] font-semibold",
                pathname === "/earn" ? "bg-button-active text-black" : "text-white"
              )}
              onClick={() => router.push("/earn")}
            >
              Earn
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              className={cn(
                "flex items-center justify-center rounded-[10px] border border-white border-opacity-20 px-4 py-2 font-roobert text-[15px] font-semibold",
                pathname === "/swap" ? "bg-button-active text-black" : "text-white"
              )}
              onClick={() => router.push("/swap")}
            >
              Buy
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
