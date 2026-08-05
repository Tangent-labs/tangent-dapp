import { cn } from "@/lib/utils"
import { ReliefCard } from "./relief_card"

interface FeatureBannerSkeletonProps {
  className?: string
}

export function FeatureBannerSkeleton({ className }: FeatureBannerSkeletonProps) {
  return (
    <ReliefCard className={cn("w-full", className)}>
      <div role="status" aria-label="Loading announcements" className="flex h-16 w-full animate-pulse items-center justify-start rounded-[10px] pl-6">
        <div className="h-5 w-44 rounded-md bg-white/10" />
        <div className="ml-6 h-6 w-20 rounded-[10px] bg-white/10" />
      </div>
    </ReliefCard>
  )
}
