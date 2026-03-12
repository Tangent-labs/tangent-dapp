import { IconTangent } from "@/components/icons"
import { IconDocs } from "@/components/icons/icon_docs"
import { IconDiscord } from "@/components/icons/icon_discord"
import { IconTwitter } from "@/components/icons/icon_twitter"
import { IconTelegram } from "@/components/icons/icon_telegram"
import { ReliefCard } from "@/components/design_system/structure/relief_card"

export const Footer = () => {
  return (
    <div className="mt-4 flex w-full items-center justify-between gap-3 border-t border-t-white/10 p-2">
      <div className="flex cursor-pointer items-center gap-2 text-xl text-white">
        <IconTangent className="w-24" />
      </div>

      <div className="flex items-center justify-center gap-2">
        <ReliefCard
          onClick={() => window?.open("https://docs.tangent.finance/docs/overview", "_blank", "noopener,noreferrer")}
          className="cursor-pointer p-2 hover:bg-white/10"
        >
          <IconDocs className="w-4" />
        </ReliefCard>

        <ReliefCard onClick={() => window?.open("https://x.com/Tangent_fi", "_blank", "noopener,noreferrer")} className="cursor-pointer p-2 hover:bg-white/10">
          <IconTwitter className="w-4" />
        </ReliefCard>

        <ReliefCard
          onClick={() => window?.open("https://t.me/+1xgNz42fNU01NGE0", "_blank", "noopener,noreferrer")}
          className="cursor-pointer p-2 hover:bg-white/10"
        >
          <IconTelegram className="w-4" />
        </ReliefCard>

        <ReliefCard
          onClick={() => window?.open("https://discord.gg/tangentfinance", "_blank", "noopener,noreferrer")}
          className="cursor-pointer p-2 hover:bg-white/10"
        >
          <IconDiscord className="w-4" />
        </ReliefCard>
      </div>
    </div>
  )
}
