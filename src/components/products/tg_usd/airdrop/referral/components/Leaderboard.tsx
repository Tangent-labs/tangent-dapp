import { Address } from "viem"
import { formatNumber } from "@/lib/number_formatter"
import { formatAddress } from "@/lib/other_formatter"
import { IconTrophy } from "@/components/icons/icon_trophy"

type LeaderboardProps = {
  leaderboard: Array<{
    rank: number
    address: Address
    pts: number
  }>
}

export const Leaderboard = ({ leaderboard }: LeaderboardProps) => {
  return (
    <>
      <div className="flex w-full items-start justify-start">
        <div className="flex w-1/4 items-start justify-start">Ranking</div>
        <div className="flex w-5/12 items-start justify-start">Address</div>
        <div className="flex w-1/3 items-start justify-start">Points</div>
      </div>

      {leaderboard?.map((el) => (
        <div key={el?.address} className="my-1 flex w-full items-center justify-start rounded-[10px] bg-overlay-panel px-2 py-1">
          <div className="flex w-1/4 items-center justify-start gap-1 font-semibold">
            {el?.rank === 1 && <IconTrophy className="w-5 fill-yellow-300"></IconTrophy>}
            {el?.rank === 2 && <IconTrophy className="w-5 fill-gray-500"></IconTrophy>}
            {el?.rank === 3 && <IconTrophy className="w-5 fill-amber-800"></IconTrophy>}
            {el.rank}
          </div>
          <div className="flex w-5/12 items-start justify-start font-semibold">{formatAddress(el.address, 4)}</div>
          <div className="flex w-1/3 items-start justify-start bg-pink bg-clip-text font-semibold text-transparent">{formatNumber(el.pts, 0)}</div>
        </div>
      ))}
    </>
  )
}
