"use client"

import { Link2, ListChecks, Trophy } from "lucide-react"
import { toast } from "react-toastify"
import { Address } from "viem"
import { useUSGContext } from "@/components/products/usg/usg_context"
import { useUsgAirdropContext } from "@/components/products/usg/airdrop/usg_airdrop_context"
import { useUsgReferralCodeContext } from "@/components/products/usg/airdrop/referral/usg_referral_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { ToastComponent } from "@/components/design_system/toast"
import { useClipboard } from "@/hooks/useClipboard"
import { formatMillions, formatNumber } from "@/lib/number_formatter"
import { formatAddress } from "@/lib/other_formatter"
import { AirdropHeaderV2 } from "./header"

/** V2 Referral page. Same contexts (referral leaderboards, airdrop referral status, USG referees points) as UsgReferralCode. */
export function ReferralPageV2() {
  const { copied, copy } = useClipboard()
  const { isConnected } = useWalletConnexionContext()
  const { refereesPoints } = useUSGContext()
  const { lpLeaderboard, voteLeaderboard, godsonsLeaderboard } = useUsgReferralCodeContext()
  const { referralStatus, airdropDataIsLoading, generateReferralCode } = useUsgAirdropContext()

  const copyAddress = (a: string) => {
    copy(a)
    toast.success(ToastComponent, { data: { type: "Success", content: "Address copied to clipboard" } })
  }
  const code = referralStatus?.generatedCode

  return (
    <div className="w-full pb-20 pt-2 font-sans">
      <AirdropHeaderV2 title="Referral and leaderboard" description="Refer your friends and earn 10% of their points." />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-2xl border border-hairline bg-surface p-5">
          <div className="text-[15px] font-semibold">Your referral</div>
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-divider pt-4 sm:grid-cols-3">
            <Metric label="Referees liquidity points" value={formatNumber(refereesPoints.lpPoints, 0)} />
            <Metric label="Referees voting points" value={formatNumber(refereesPoints.votePoints, 0)} />
            <Metric label="Your referees" value={String(referralStatus?.friends ?? 0)} />
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-surface p-5">
          <div className="text-[15px] font-semibold">Your code</div>
          <div className="mt-4 border-t border-divider pt-4">
            {!isConnected && <p className="text-[13px] text-ink-3">Connect a wallet to get a referral code.</p>}
            {isConnected && !airdropDataIsLoading && code && (
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-[20px] font-medium tracking-[-0.01em]">{code}</span>
                <button
                  onClick={() => copy(`${process.env.NEXT_PUBLIC_REFERAL_BASE_LINK}/referral?code=${code}`)}
                  className="h-9 shrink-0 rounded-[9px] bg-action px-4 text-[13px] font-semibold text-white transition-colors hover:bg-action-hover"
                >
                  {copied ? "Copied" : "Share link"}
                </button>
              </div>
            )}
            {isConnected && !airdropDataIsLoading && !code && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-ink-2">Get a referral code for a friend.</span>
                <button
                  onClick={generateReferralCode}
                  className="h-9 shrink-0 rounded-[9px] bg-action px-4 text-[13px] font-semibold text-white transition-colors hover:bg-action-hover"
                >
                  Generate
                </button>
              </div>
            )}
            {isConnected && airdropDataIsLoading && <div className="h-9 animate-pulse rounded-lg bg-white/[0.04]" />}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-hairline bg-surface p-5 md:grid-cols-3">
        <Step icon={Link2} title="Share link" text="Connect a wallet. Generate a referral link. Invite your friends to register via your referral link." />
        <Step icon={ListChecks} title="Complete tasks" text="Ask your friends to complete tasks so that they earn points to be eligible for the airdrop." />
        <Step
          icon={Trophy}
          title="Earn points"
          text="Referrers earn 10% of the points earned by their referred users, while referred users receive a 1.1x multiplier on all task points."
        />
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <Board title="Liquidity points leaderboard" rows={lpLeaderboard} onCopy={copyAddress} />
        <Board title="Vote points leaderboard" rows={voteLeaderboard} onCopy={copyAddress} />
        <div className="rounded-2xl border border-hairline bg-surface p-5">
          <div className="text-[15px] font-semibold">My referees</div>
          <div className="mt-4 border-t border-divider pt-3">
            <div className="grid grid-cols-[40px_minmax(0,1fr)_64px_64px] gap-2 px-2 pb-2 text-xs text-ink-3">
              <span>Rank</span>
              <span>Address</span>
              <span className="text-right">Liquidity</span>
              <span className="text-right">Vote</span>
            </div>
            {[...(godsonsLeaderboard ?? [])]
              .sort((a, b) => Number(b.lpPoints) + Number(b.votePts) - (Number(a.lpPoints) + Number(a.votePts)))
              .map((g) => (
                <div
                  key={g.address}
                  className="grid grid-cols-[40px_minmax(0,1fr)_64px_64px] items-center gap-2 rounded-lg px-2 py-2 text-[13px] hover:bg-white/[0.035]"
                >
                  <span className="tabular-nums text-ink-2">{g.rank}</span>
                  <button onClick={() => copyAddress(g.address)} className="w-fit font-medium hover:text-action">
                    {formatAddress(g.address, 4)}
                  </button>
                  <span className="text-right tabular-nums">{formatMillions(g.lpPoints)}</span>
                  <span className="text-right tabular-nums">{formatMillions(g.votePts)}</span>
                </div>
              ))}
            {!godsonsLeaderboard?.length && <p className="px-2 py-6 text-center text-[13px] text-ink-3">No referee yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-3">{label}</div>
      <div className="mt-1 text-[24px] font-medium tabular-nums tracking-[-0.02em]">{value}</div>
    </div>
  )
}

function Step({ icon: Icon, title, text }: { icon: typeof Link2; title: string; text: string }) {
  return (
    <div>
      <Icon className="h-5 w-5 text-action" strokeWidth={1.75} />
      <div className="mt-3 text-[15px] font-semibold">{title}</div>
      <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{text}</p>
    </div>
  )
}

function Board({ title, rows, onCopy }: { title: string; rows: { rank: number; address: Address; pts: number }[]; onCopy: (a: string) => void }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <div className="text-[15px] font-semibold">{title}</div>
      <div className="mt-4 border-t border-divider pt-3">
        <div className="grid grid-cols-[40px_minmax(0,1fr)_80px] gap-2 px-2 pb-2 text-xs text-ink-3">
          <span>Rank</span>
          <span>Address</span>
          <span className="text-right">Points</span>
        </div>
        {[...(rows ?? [])]
          .sort((a, b) => Number(b.pts) - Number(a.pts))
          .map((r) => (
            <div
              key={r.address}
              className="grid grid-cols-[40px_minmax(0,1fr)_80px] items-center gap-2 rounded-lg px-2 py-2 text-[13px] hover:bg-white/[0.035]"
            >
              <span className="tabular-nums text-ink-2">{r.rank}</span>
              <button onClick={() => onCopy(r.address)} className="w-fit font-medium hover:text-action">
                {formatAddress(r.address, 4)}
              </button>
              <span className="text-right font-semibold tabular-nums">{formatMillions(r.pts)}</span>
            </div>
          ))}
        {!rows?.length && <p className="px-2 py-6 text-center text-[13px] text-ink-3">No data yet.</p>}
      </div>
    </div>
  )
}
