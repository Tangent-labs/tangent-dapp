import { ReliefCard } from "./relief_card"

export default function PointsCampaignLiveCard() {
  return (
    <ReliefCard className="w-full">
      <div
        style={{ fontSize: "20px", lineHeight: "20px" }}
        className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+120px)_center] bg-no-repeat px-6 !font-semibold italic"
      >
        Points campaign
        <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
      </div>
    </ReliefCard>
  )
}
