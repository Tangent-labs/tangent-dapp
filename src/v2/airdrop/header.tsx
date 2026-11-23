"use client"

import { useState } from "react"
import { useUSGContext } from "@/components/products/usg/usg_context"
import { useUsgAirdropContext } from "@/components/products/usg/airdrop/usg_airdrop_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { formatMillions, formatNumber } from "@/lib/number_formatter"

/**
 * Header shared by the Airdrop pages (Tasks, Referral, Boosts): title, points strip and referral code bar.
 * Same data as the live AirdropSharedHeader (useUSGContext points, useUsgAirdropContext referral).
 */
export function AirdropHeaderV2({ title, description }: { title: string; description: string }) {
  const { lpUserPoints, voteUserPoints, userBoostFactor } = useUSGContext()
  const { setReferralStatus, referralStatus, airdropDataIsLoading, signMessage } = useUsgAirdropContext()
  const { isConnected } = useWalletConnexionContext()
  const [openCode, setOpenCode] = useState(false)

  return (
    <>
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">{title}</h1>
      <p className="mt-1 max-w-[760px] text-[14px] text-ink-2">{description}</p>

      <div className="mt-8 flex flex-wrap items-stretch gap-y-4">
        <Stat
          first
          label="Liquidity points"
          value={`${formatMillions(lpUserPoints?.lpTotalPoints)} pts`}
          sub={`${formatMillions((lpUserPoints?.lpDailyRate || 0) * userBoostFactor)} pts/day`}
        />
        <Stat label="Voting points" value={`${formatNumber(voteUserPoints?.voteTotalPoints, 0)} pts`} sub="Vote campaign" />
        <Stat label="Your boost" value={`x${userBoostFactor}`} sub={referralStatus?.hasUsedCode ? "Referral code applied" : "Enter a code for x1.1"} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-hairline bg-surface px-5 py-3.5">
        {!airdropDataIsLoading && referralStatus?.hasUsedCode ? (
          <span className="text-[13px] text-ink-2">Referral code applied. You keep a permanent +0.1 boost on all your points.</span>
        ) : (
          <>
            <span className="text-[13px] text-ink-2">Enter a referral code to get a x1.1 boost on all your points.</span>
            <div className="ml-auto flex items-center gap-2">
              {openCode ? (
                <>
                  <input
                    disabled={!isConnected}
                    placeholder="Referral code"
                    value={(referralStatus?.referralCode as string) ?? ""}
                    onChange={(e) => setReferralStatus({ ...referralStatus, referralCode: e?.target?.value })}
                    className="h-9 w-[200px] rounded-[9px] border border-white/10 bg-transparent px-3 text-[13px] outline-none placeholder:text-ink-3 focus:border-action disabled:opacity-50"
                  />
                  <button
                    onClick={signMessage}
                    disabled={airdropDataIsLoading || !isConnected}
                    className="h-9 rounded-[9px] bg-action px-4 text-[13px] font-semibold text-white transition-colors hover:bg-action-hover disabled:opacity-40"
                  >
                    Apply
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setOpenCode(true)}
                  className="h-9 rounded-[9px] border border-white/10 px-4 text-[13px] font-semibold transition-colors hover:bg-white/[0.05]"
                >
                  Enter code
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function Stat({ label, value, sub, first }: { label: string; value: string; sub?: string; first?: boolean }) {
  return (
    <div className={first ? "min-w-[180px] flex-1 pr-6" : "min-w-[180px] flex-1 border-l border-divider px-6"}>
      <div className="text-xs text-ink-3">{label}</div>
      <div className="mt-1 whitespace-nowrap text-[28px] font-medium tabular-nums tracking-[-0.02em]">{value}</div>
      {sub && <div className="mt-1.5 text-xs text-ink-2">{sub}</div>}
    </div>
  )
}

/** Status as dot + word, never a tinted pill. */
export function StatusDot({ on, onLabel = "Active", offLabel = "Inactive" }: { on: boolean; onLabel?: string; offLabel?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px]">
      <span className={on ? "size-2 rounded-full bg-action" : "size-2 rounded-full bg-white/25"} />
      <span className={on ? "text-white" : "text-ink-3"}>{on ? onLabel : offLabel}</span>
    </span>
  )
}
