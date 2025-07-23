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

    return feat
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
                "text-sm font-semibold text-white transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-transparent aria-disabled:text-gray-500",
                pathname === "/" ? "bg-tab bg-clip-text font-bold text-transparent" : ""
              )}
              onClick={() => router.push("/")}
            >
              Markets
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              className={cn(
                "text-sm font-semibold text-white transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-transparent aria-disabled:text-gray-500",
                pathname === "/stake" ? "bg-tab bg-clip-text font-bold text-transparent" : ""
              )}
              onClick={() => router.push("/stake")}
            >
              Stake
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              className={cn(
                "text-sm font-semibold text-white transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-transparent aria-disabled:text-gray-500",
                pathname === "/earn" ? "bg-tab bg-clip-text font-bold text-transparent" : ""
              )}
              onClick={() => router.push("/earn")}
            >
              Earn
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              className={cn(
                "text-sm font-semibold text-white transition-colors duration-200 hover:bg-tab hover:bg-clip-text hover:text-transparent aria-disabled:text-gray-500",
                pathname === "/swap" ? "bg-tab bg-clip-text font-bold text-transparent" : ""
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
