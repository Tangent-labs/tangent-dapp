import { Button } from "@/components/design_system/inputs/button"
import BorderPanel from "@/components/design_system/structure/border_panel"
import Divider from "@/components/design_system/structure/divider"
import { IconCompleted } from "@/components/icons/icon_completed"
import { IconShare } from "@/components/icons/icon_share"
import { IconTrophy } from "@/components/icons/icon_trophy"

const Ranking = () => {
  return (
    <>
      <div className="flex w-full items-start justify-start">
        <div className="flex w-1/3 items-start justify-start">Ranking</div>
        <div className="flex w-1/3 items-start justify-start">Address</div>
        <div className="flex w-1/3 items-start justify-start">Points</div>
      </div>

      {[
        { rank: 1, address: "0x64129410B4Ae43c13D79537f114E3B46F97Ac92a", pts: 1234 },
        { rank: 2, address: "0x042Eb27B32235B6cd99f74ba00e05c7166964019", pts: 1000 },
        { rank: 3, address: "0x9beAA846aD08A22Bc504D1ca535C9E1BC109EA69", pts: 293 },
        { rank: 4, address: "0xc600e7F967a0892A39Fb7FB8AcCb237A2B62af72", pts: 12 },
        { rank: 4, address: "0xAcCb237A2967a02A39Fb7FB8AcCb237A2B62af72", pts: 1 },
      ].map((el) => (
        <BorderPanel key={el?.address} className="my-1 flex w-full items-start justify-start bg-overlay-panel px-2 py-1 backdrop-blur-[60px]">
          <div className="flex w-1/3 items-center justify-start gap-1 font-semibold">
            {el?.rank === 1 && <IconTrophy className="w-5 fill-yellow-300"></IconTrophy>}
            {el?.rank === 2 && <IconTrophy className="w-5 fill-gray-500"></IconTrophy>}
            {el?.rank === 3 && <IconTrophy className="w-5 fill-amber-800"></IconTrophy>}
            {el.rank}
          </div>
          <div className="flex w-1/3 items-start justify-start font-semibold">{el.address.substring(0, 5) + "..."}</div>
          <div className="flex w-1/3 items-start justify-start font-semibold">{el.pts}</div>
        </BorderPanel>
      ))}
    </>
  )
}

export default async function TgUsdReferralPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <BorderPanel className="mt-6 flex w-full flex-col items-center justify-center rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
        <div className="mr-auto text-lg font-semibold text-white">Your referral</div>

        <Divider className="h-0.5 w-full bg-white/10" />

        <div className="flex w-full items-center justify-between">
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm text-subtitle">Referees points</span>
            <span className="text-lg font-semibold">10,500</span>
          </div>
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm text-subtitle">Your Referees</span>
            <span className="text-lg font-semibold">12</span>
          </div>
          <div className="flex w-full flex-col items-center justify-center">
            <span className="text-sm text-subtitle">Your code</span>
            <span className="text-lg font-semibold">YHD6D87E</span>
          </div>
          <div className="flex w-full flex-col items-center justify-center">
            <Button className="flex w-32 justify-center font-semibold">Share</Button>
          </div>
        </div>
      </BorderPanel>

      <div className="my-4 flex w-full flex-col items-center justify-center rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
        <div className="mr-auto text-lg font-semibold text-white">Airdrop referral</div>

        <Divider className="h-0.5 w-full bg-white/10" />

        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex w-full flex-col items-center justify-center rounded-[10px] p-3 backdrop-blur-[60px]">
            <IconShare></IconShare>

            <span className="text-lg font-semibold">Share link</span>
            <span className="mt-2 text-center text-sm text-subtitle">
              Connect a wallet to generate a referral link. Invite your friends to register via your referral link.
            </span>
          </div>

          <div className="flex w-full flex-col items-center justify-center rounded-[10px] p-3 backdrop-blur-[60px]">
            <IconCompleted></IconCompleted>
            <span className="text-lg font-semibold">Complete tasks</span>
            <span className="mt-2 text-center text-sm text-subtitle">
              Ask your friends to complete tasks so that they earn points to be eligible for the airdrop.
            </span>
          </div>

          <div className="flex w-full flex-col items-center justify-center rounded-[10px] p-3 backdrop-blur-[60px]">
            <IconTrophy className="w-12 fill-row-tonic"></IconTrophy>
            <span className="text-lg font-semibold">Earn points</span>
            <span className="mt-2 text-center text-sm text-subtitle">
              Referrer will earn 10% of referees points, referees will have a x1.2 boost on all tasks points.
            </span>
          </div>
        </div>
      </div>

      <div className="my-4 flex w-full items-center justify-between gap-4">
        <div className="flex w-full flex-col items-center justify-center rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
          <div className="mr-auto text-lg font-semibold text-white">Referral ranking</div>

          <Divider className="h-0.5 w-full bg-white/10" />

          <Ranking />
        </div>

        <div className="flex w-full flex-col items-center justify-center rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
          <div className="mr-auto text-lg font-semibold text-white">My referrees ranking</div>

          <Divider className="h-0.5 w-full bg-white/10" />

          <Ranking />
        </div>

        <div className="flex w-full flex-col items-center justify-center rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
          <div className="mr-auto text-lg font-semibold text-white">Points ranking</div>

          <Divider className="h-0.5 w-full bg-white/10" />

          <Ranking />
        </div>
      </div>
    </div>
  )
}
