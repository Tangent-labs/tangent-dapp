"use client"

import { Button } from "@/components/design_system/inputs/button"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

export default function TgUsdAirdropLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()

  const pathname = usePathname()

  return (
    <>
      <div className="sgusd-card w-7/12">
        <div className="flex items-center justify-center">
          <Image height={440} width={440} className="an-logo" src="/medias/product_tgusd.png" alt="token" />
        </div>
        <div className="flex flex-col items-start justify-between gap-3">
          <span className="text-4xl">Airdrop</span>

          <p>
            Participate in our airdrop to receive free tokens directly to your wallet, boosting your holdings with no upfront cost. You can also earn additional
            rewards by engaging with select community activities (e.g., governance voting & liquidity provision).
          </p>
          <p>Airdrop distributions occur monthly, at the start of each cycle. Claimed tokens are tracked via unique wallet signatures. Learn more</p>
        </div>
      </div>

      <div className="my-3 flex items-start justify-start gap-3">
        <Button state={pathname === "/airdrop" ? "active" : "inactive"} onClick={() => router.push("/airdrop")} className="flex w-32 justify-center">
          Tasks
        </Button>
        <Button
          state={pathname === "/airdrop/referral" ? "active" : "inactive"}
          onClick={() => router.push("/airdrop/referral")}
          className="flex w-32 justify-center"
        >
          Referral
        </Button>
        <Button
          state={pathname === "/airdrop/tangium-pass" ? "active" : "inactive"}
          onClick={() => router.push("/airdrop/tangium-pass")}
          className="flex w-32 justify-center"
        >
          Tangium Pass
        </Button>
      </div>

      {children}
    </>
  )
}
