"use client"

import { IconTangent } from "@/components/icons"
import { IconDocs } from "@/components/icons/icon_docs"
import { IconDiscord } from "@/components/icons/icon_discord"
import { IconTwitter } from "@/components/icons/icon_twitter"
import { IconTelegram } from "@/components/icons/icon_telegram"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import Link from "next/link"

export const Footer = () => {
  return (
    <div className="mt-8 flex w-full items-center justify-between border-t border-t-white/10 p-2 backdrop-blur-[60px]">
      <div className="flex items-center justify-center">
        <IconTangent className="w-24" />
      </div>

      <div className="flex items-center justify-center gap-2">
        <Link href="https://docs.tangent.finance/docs/overview" target="_blank" rel="noopener noreferrer">
          <ReliefCard className="cursor-pointer p-2 hover:bg-white/10">
            <IconDocs className="w-4" />
          </ReliefCard>
        </Link>

        <Link href="https://x.com/Tangent_fi" target="_blank" rel="noopener noreferrer">
          <ReliefCard className="cursor-pointer p-2 hover:bg-white/10">
            <IconTwitter className="w-4" />
          </ReliefCard>
        </Link>

        <Link href="https://t.me/+1xgNz42fNU01NGE0" target="_blank" rel="noopener noreferrer">
          <ReliefCard className="cursor-pointer p-2 hover:bg-white/10">
            <IconTelegram className="w-4" />
          </ReliefCard>
        </Link>

        <Link href="https://discord.gg/tangentfinance" target="_blank" rel="noopener noreferrer">
          <ReliefCard className="cursor-pointer p-2 hover:bg-white/10">
            <IconDiscord className="w-4" />
          </ReliefCard>
        </Link>
      </div>
    </div>
  )
}
