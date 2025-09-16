import { IconTrophy } from "@/components/icons/icon_trophy"
import { formatNumber } from "@/lib/number_formatter"
import { formatAddress } from "@/lib/other_formatter"
import { Address } from "viem"

type VotingPointsLeaderboardProps = {
  voteLeaderboard: Array<{
    rank: number
    address: Address
    pts: number
  }>
}

export const VotingPointsLeaderboard = ({ voteLeaderboard }: VotingPointsLeaderboardProps) => {
  return (
    <>
      <div className="flex w-full items-start justify-start">
        <div className="flex w-1/3 items-start justify-start">Ranking</div>
        <div className="flex w-1/3 items-start justify-start">Address</div>
        <div className="flex w-1/3 items-start justify-start">Points</div>
      </div>

      {voteLeaderboard?.map((el) => (
        <div key={el?.address} className="my-1 flex w-full items-start justify-start bg-overlay-panel px-2 py-1 backdrop-blur-[60px]">
          <div className="flex w-1/3 items-center justify-start gap-1 font-semibold">
            {el?.rank === 1 && <IconTrophy className="w-5 fill-yellow-300"></IconTrophy>}
            {el?.rank === 2 && <IconTrophy className="w-5 fill-gray-500"></IconTrophy>}
            {el?.rank === 3 && <IconTrophy className="w-5 fill-amber-800"></IconTrophy>}
            {el.rank}
          </div>
          <div className="flex w-1/3 items-start justify-start font-semibold">{formatAddress(el.address, 4)}</div>
          <div className="flex w-1/3 items-start justify-start font-semibold">{formatNumber(el.pts, 0)}</div>
        </div>
      ))}
    </>
  )
}
