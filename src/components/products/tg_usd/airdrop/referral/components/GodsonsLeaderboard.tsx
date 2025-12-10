"use client"

import { toast } from "react-toastify"
import { useClipboard } from "@/hooks/useClipboard"
import { formatAddress } from "@/lib/other_formatter"
import { formatNumber } from "@/lib/number_formatter"
import { GodsonLeaderboard } from "../../../tg_usd_type"
import { IconTrophy } from "@/components/icons"
import { ToastComponent } from "@/components/design_system/toast"

type GodsonsLeaderboardProps = {
  godsonsLeaderboard: GodsonLeaderboard
}

export const GodsonsLeaderboard = ({ godsonsLeaderboard }: GodsonsLeaderboardProps) => {
  const { copy } = useClipboard()

  const onClickAddress = (address: string) => {
    copy(address)
    toast.success(ToastComponent, { data: { type: "Success", content: "Address copied to clipboard" } })
  }

  return (
    <>
      <div className="flex w-full items-start justify-start">
        <div className="flex w-1/4 items-start justify-start">Ranking</div>
        <div className="flex w-1/3 items-start justify-start">Address</div>
        <div className="flex w-1/3 items-start justify-start">Points</div>
      </div>

      {godsonsLeaderboard
        ?.sort((a, b) => Number(b.lpPoints) + Number(b.votePts) - (Number(a.lpPoints) + Number(a.votePts)))
        .map((el) => (
          <div key={el?.address} className="my-1 flex w-full items-center justify-start rounded-[10px] bg-overlay-panel px-2 py-1">
            <div className="flex w-2/12 items-center justify-start gap-1 font-semibold">
              {el?.rank === 1 && <IconTrophy className="w-5 fill-yellow-300"></IconTrophy>}
              {el?.rank === 2 && <IconTrophy className="w-5 fill-gray-500"></IconTrophy>}
              {el?.rank === 3 && <IconTrophy className="w-5 fill-amber-800"></IconTrophy>}
              {el.rank}
            </div>
            <div onClick={() => onClickAddress(el?.address)} className="flex w-4/12 items-start justify-start font-semibold">
              {formatAddress(el.address, 4)}
            </div>
            <div className="flex w-3/12 items-center justify-center bg-pink bg-clip-text text-xs font-semibold text-transparent">
              {formatNumber(el.lpPoints, 0)}
            </div>
            <div className="flex w-3/12 items-center justify-center bg-tonic bg-clip-text text-xs font-semibold text-transparent">
              {formatNumber(el.votePts, 0)}
            </div>
          </div>
        ))}
    </>
  )
}
