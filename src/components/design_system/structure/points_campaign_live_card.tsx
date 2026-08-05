import { cn } from "@/lib/utils"
import { ReliefCard } from "./relief_card"

interface PointsCampaignLiveCardProps {
  className?: string
}

/** Static fallback for the carousel: what shows once banners have loaded and the API has none. */
export function PointsCampaignLiveCard({ className }: PointsCampaignLiveCardProps) {
  return (
    <ReliefCard className={cn("w-full", className)}>
      <div
        style={{ fontSize: "20px", lineHeight: "20px" }}
        className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/fulltan.png')] bg-[size:55%] bg-[position:calc(100%)_bottom] bg-no-repeat px-6 !font-semibold italic"
      >
        Points campaign
        <div className="ml-6 flex items-center justify-center rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">Live</div>
      </div>
    </ReliefCard>
  )
}
