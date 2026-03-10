"use client"

import { IconMenuMore } from "@/components/icons"
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"

export const MenuModal = () => {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>
          <>
            <IconMenuMore className="w-6"></IconMenuMore>
            More
          </>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#1A1A1A] text-white">
        <div className="flex flex-col space-y-2">
          <h3 className="mb-2 text-lg font-semibold">More</h3>

          <DialogClose asChild>
            <button
              className={cn(
                "flex items-center justify-center rounded-[10px] border border-white border-opacity-10 px-4 py-2 text-[15px] font-semibold",
                pathname === "/swap" ? "bg-button-active text-black" : "text-white"
              )}
              onClick={() => router.push("/swap")}
            >
              Swap
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              className={cn(
                "flex items-center justify-center rounded-[10px] border border-white border-opacity-10 px-4 py-2 text-[15px] font-semibold",
                pathname === "/claim" ? "bg-button-active text-black" : "text-white"
              )}
              onClick={() => router.push("/claim")}
            >
              Claim
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              className={cn(
                "flex items-center justify-center rounded-[10px] border border-white border-opacity-10 px-4 py-2 text-[15px] font-semibold",
                pathname === "/harvest" ? "bg-button-active text-black" : "text-white"
              )}
              onClick={() => router.push("/harvest")}
            >
              Harvest
            </button>
          </DialogClose>

          <DialogClose asChild>
            <button
              className={cn(
                "flex items-center justify-center rounded-[10px] border border-white border-opacity-10 px-4 py-2 text-[15px] font-semibold",
                pathname === "/tasks" ? "bg-button-active text-black" : "text-white"
              )}
              onClick={() => router.push("/tasks")}
            >
              Tasks
            </button>
          </DialogClose>

          <DialogClose asChild>
            <button
              className={cn(
                "flex items-center justify-center rounded-[10px] border border-white border-opacity-10 px-4 py-2 text-[15px] font-semibold",
                pathname === "/referral" ? "bg-button-active text-black" : "text-white"
              )}
              onClick={() => router.push("/referral")}
            >
              Referral
            </button>
          </DialogClose>

          <DialogClose asChild>
            <button
              className={cn(
                "flex items-center justify-center rounded-[10px] border border-white border-opacity-10 px-4 py-2 text-[15px] font-semibold",
                pathname === "/boosts" ? "bg-button-active text-black" : "text-white"
              )}
              onClick={() => router.push("/boosts")}
            >
              Boosts
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
