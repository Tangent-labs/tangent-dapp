"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUSGContext } from "@/components/products/usg/usg_context"
import { useUsgAirdropContext } from "@/components/products/usg/airdrop/usg_airdrop_context"
import { useUsgClaimAirdropContext } from "@/components/products/usg/airdrop/claim/usg_claim_airdrop_context"
import {
  AIRDROP_CATEGORIES,
  AIRDROP_SNAPSHOT_DATE,
  AirdropCategoryId,
  AirdropTile,
  formatShare,
  formatTan,
  shortenAddress,
} from "@/components/products/usg/airdrop/claim/usg_claim_airdrop_controller"
import { Button } from "@/components/design_system/inputs/button"
import { IconTan } from "@/components/icons"
import { formatMillions, formatNumber } from "@/lib/number_formatter"

// Claim is not live yet: same switch as the live recap (flip when the contract is ready)
const CLAIM_ENABLED = false

// V2 palette: blue for data, no green
const CAT_COLOR: Record<AirdropCategoryId, string> = {
  compensationCvg: "#0075FF",
  pointCampaign: "#a79bff",
  preDeposit: "#e78fb3",
  others: "#8fa3bf",
}

/**
 * V2 Claim airdrop page. Same contexts as UsgClaimAirdropContent (claim airdrop, airdrop referral, USG points).
 * Total as hero, one stat per category, then the allocation details (or the global pools when the wallet has none).
 */
export function ClaimAirdropPageV2() {
  const { lpUserPoints, voteUserPoints, userBoostFactor } = useUSGContext()
  const { setReferralStatus, referralStatus, airdropDataIsLoading, signMessage } = useUsgAirdropContext()
  const { isLoading, isConnected, address, recipient, allocations, distribution, totalAmount, claimStatus, claimAll, connect } = useUsgClaimAirdropContext()
  const [openCode, setOpenCode] = useState(false)

  const hasAllocation = !!recipient && totalAmount > 0
  const isClaimed = claimStatus === "claimed"
  const showWallet = isConnected && !isLoading

  return (
    <div className="w-full pb-20 pt-2 font-sans">
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Airdrop</h1>
      <p className="mt-1 text-[14px] text-ink-2">Check and claim your TAN allocation.</p>

      <div className="v2-kpis mt-8 flex flex-wrap items-stretch gap-y-4">
        <div className="min-w-[260px] flex-[1.6] pr-8">
          <div className="text-xs text-ink-3">{isClaimed ? "Claimed" : "Total allocation"}</div>
          <div className="mt-1 flex items-center gap-3">
            <IconTan className="size-9 shrink-0" />
            <span className="text-[48px] font-light tabular-nums leading-[1.05] tracking-[-0.02em]">{showWallet ? formatTan(totalAmount) : "-"}</span>
            <span className="mt-4 text-[15px] text-ink-2">TAN</span>
          </div>
          <div className="mt-2 text-xs text-ink-3">{showWallet ? `Wallet ${shortenAddress(address)}` : `Snapshot of ${AIRDROP_SNAPSHOT_DATE}`}</div>
        </div>
        <Stat
          label="Liquidity points"
          value={`${formatMillions(lpUserPoints?.lpTotalPoints)} pts`}
          sub={`${formatMillions((lpUserPoints?.lpDailyRate || 0) * userBoostFactor)} pts/day`}
        />
        <Stat label="Voting points" value={`${formatNumber(voteUserPoints?.voteTotalPoints, 0)} pts`} sub="Vote campaign" />
        <Stat label="Your boost" value={`x${userBoostFactor}`} sub={referralStatus?.hasUsedCode ? "Referral code applied" : "Enter a code for x1.1"} />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-hairline py-3.5">
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
                    className="h-9 rounded-[9px] bg-action-fill px-4 text-[13px] font-semibold text-white transition-colors hover:bg-action-fill-hover disabled:opacity-40"
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

      {!isConnected && (
        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-hairline bg-surface p-5">
          <div>
            <div className="text-[17px] font-semibold">Connect your wallet</div>
            <p className="mt-1 text-[13px] text-ink-2">See your TAN allocation by category and claim it in a single transaction.</p>
          </div>
          <Button label="Connect wallet" onClick={connect} className="ml-auto w-full md:w-[168px]" />
        </div>
      )}

      {showWallet && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_260px]">
          {allocations.map((a) => {
            const ratio = totalAmount > 0 ? a.amount / totalAmount : 0
            const eligible = a.amount > 0
            return (
              <div key={a.id} className="rounded-2xl border border-hairline bg-surface p-5">
                <div className="flex items-center gap-2 text-[13px] text-ink-2">
                  <span className="size-2 rounded-full" style={{ background: CAT_COLOR[a.id] }} />
                  {AIRDROP_CATEGORIES[a.id].label}
                </div>
                <div className="mt-3 flex items-baseline gap-1.5 tabular-nums">
                  <span className="text-[24px] font-medium tracking-[-0.02em]">{eligible ? formatTan(a.amount) : "0"}</span>
                  <span className="text-xs text-ink-3">TAN</span>
                </div>
                {eligible ? (
                  <>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded bg-white/[0.08]">
                      <div className="h-1" style={{ width: `${Math.min(ratio, 1) * 100}%`, background: CAT_COLOR[a.id] }} />
                    </div>
                    <div className="mt-2 text-xs text-ink-3">{formatShare(ratio)} of your total</div>
                  </>
                ) : (
                  <div className="mt-3 text-xs text-ink-3">Not eligible</div>
                )}
              </div>
            )
          })}

          <div className="rounded-2xl border border-hairline bg-surface p-5">
            <div className="text-[13px] text-ink-2">{hasAllocation ? (isClaimed ? "Claimed" : "Ready to claim") : "Nothing to claim"}</div>
            <div className="mt-3">
              {hasAllocation && claimStatus === "idle" && (
                <Button
                  label="Claim all"
                  className="flex w-full items-center justify-center"
                  state={CLAIM_ENABLED ? "active" : "disabled"}
                  onClick={claimAll}
                />
              )}
              {hasAllocation && claimStatus === "claiming" && (
                <Button label="Claiming..." className="flex w-full items-center justify-center" state="disabled" />
              )}
              {isClaimed && (
                <div className="flex h-10 items-center justify-center gap-2 rounded-[10px] border border-white/10 text-[13px] font-semibold">
                  <Check className="h-4 w-4" strokeWidth={2.5} /> Claimed
                </div>
              )}
              {!hasAllocation && (
                <button
                  onClick={connect}
                  className="h-10 w-full rounded-[10px] border border-white/10 text-[13px] font-semibold transition-colors hover:bg-white/[0.05]"
                >
                  Switch wallet
                </button>
              )}
            </div>
            {hasAllocation && claimStatus === "idle" && !CLAIM_ENABLED && <div className="mt-2 text-xs text-ink-3">Claim opens soon.</div>}
            {claimStatus === "claiming" && <div className="mt-2 text-xs text-ink-3">Confirm in your wallet</div>}
          </div>
        </div>
      )}

      {isLoading && <div className="v2-shimmer mt-6 h-40 rounded-2xl" />}

      {showWallet && !hasAllocation && (
        <div className="mt-4 rounded-2xl border border-hairline bg-surface p-5">
          <div className="text-[15px] font-semibold">No TAN allocation for this wallet</div>
          <p className="mt-1 text-[13px] text-ink-2">This wallet has no TAN allocation at the current snapshot.</p>
        </div>
      )}

      {!isLoading && hasAllocation && (
        <div className="mt-10 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {allocations
            .filter((a) => a.amount > 0)
            .map((a) => (
              <Panel key={a.id} id={a.id} label={isClaimed ? "Claimed" : "Allocation"} amount={a.amount}>
                {a.sections.map((s) => (
                  <div key={s.title} className="space-y-2">
                    <div className="flex items-baseline gap-2 whitespace-nowrap">
                      <span className="text-[13px] font-semibold">{s.title}</span>
                      {s.pool !== undefined && <span className="text-xs text-ink-3">Pool {formatTan(s.pool)} TAN</span>}
                      <span className="ml-auto text-[13px] font-semibold tabular-nums">{formatTan(s.amount)}</span>
                      <span className="text-xs text-ink-3">TAN</span>
                    </div>
                    <Tiles tiles={s.tiles} />
                  </div>
                ))}
              </Panel>
            ))}
        </div>
      )}

      {!isLoading && !hasAllocation && (
        <div className="mt-8">
          <h2 className="text-[20px] font-semibold tracking-[-0.01em]">Airdrop distribution</h2>
          <p className="mt-1 text-[13px] text-ink-2">TAN pools by category. Snapshot of {AIRDROP_SNAPSHOT_DATE}.</p>
          <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {distribution.map((c) => (
              <Panel key={c.id} id={c.id} label="Pool" amount={c.pool}>
                <Tiles tiles={c.tiles} />
              </Panel>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Panel({ id, label, amount, children }: { id: AirdropCategoryId; label: string; amount: number; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface p-5">
      <div className="flex items-center gap-2.5">
        <span className="size-2 rounded-full" style={{ background: CAT_COLOR[id] }} />
        <span className="text-[16px] font-semibold">{AIRDROP_CATEGORIES[id].label}</span>
        <span className="ml-auto text-xs text-ink-3">{label}</span>
        <span className="text-[16px] font-medium tabular-nums">{formatTan(amount)}</span>
        <span className="text-xs text-ink-3">TAN</span>
      </div>
      <div className="mt-4 space-y-5 border-t border-divider pt-4">{children}</div>
    </div>
  )
}

function Tiles({ tiles }: { tiles: AirdropTile[] }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", tiles.length > 2 && "md:grid-cols-3")}>
      {tiles.map((t) => (
        <div key={t.label} className="min-w-0 rounded-[10px] bg-white/[0.03] px-3 py-2">
          <div className="truncate text-xs text-ink-3">{t.label}</div>
          <div className="mt-0.5 flex items-baseline gap-1 whitespace-nowrap tabular-nums">
            <span className="text-[14px] font-semibold">{t.value}</span>
            {t.unit && <span className="text-xs text-ink-3">{t.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-[150px] flex-1 border-l border-divider px-6">
      <div className="text-xs text-ink-3">{label}</div>
      <div className="mt-1 whitespace-nowrap text-[24px] font-medium tabular-nums tracking-[-0.02em]">{value}</div>
      {sub && <div className="mt-1.5 text-xs text-ink-2">{sub}</div>}
    </div>
  )
}
