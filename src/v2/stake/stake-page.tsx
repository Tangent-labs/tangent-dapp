"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { formatUnits } from "viem"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUSGStakeContext } from "@/components/products/usg/stake/usg_stake_context"
import { computeProjection } from "@/components/products/usg/stake/usg_stake_controller"
import { PositionAPR } from "@/components/products/usg/stake/components/position_apr"
import { PositionTVL } from "@/components/products/usg/stake/components/position_tvl"
import { ForecastGraph } from "@/components/products/usg/stake/components/usg_staking_forecast"
import { useRootContext } from "@/components/products/root/root_context"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import FormButtons from "@/components/design_system/form/form_actions"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { LargeButtonTab } from "@/components/design_system/inputs/large_button_tab"
import { GenericInputAssetAmount } from "@/components/design_system/inputs/GenericInputAssetAmount"
import { StaticCardAssetInput } from "@/components/products/predeposit/components/StaticCardAssetInput"
import { SlidingTabs } from "@/components/products/usg/airdrop/tasks/components/SlidingTabs"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { formatBigInt, formatDollar, formatMillions, formatNumber } from "@/lib/number_formatter"

const TABS = ["APY history", "TVL history", "Projected earnings"]

/**
 * V2 Savings page. Same context, same controller, same chart components and same form pieces as USGStakeContent:
 * only the arrangement changes (hero with the current APY and the charts on the left, a sticky action card and "Your position" on the right).
 */
export function StakePageV2() {
  const {
    actionStake,
    actionUnstake,
    actionApprove,
    setCurrentFeature,
    setStakePercentage,
    setWeiValue,
    fetchsUSGHistoryAPY,
    currentFeature,
    currentAssetInfo,
    weiValue,
    expected,
    receivedTokenInfo,
    formState,
    computeProjectedValue,
    stakePercentage,
    USGsUSGMetrics,
    sUSGSelectedTab,
    apyHistory,
    isLoading,
  } = useUSGStakeContext()
  const { sUSGCurrentAPY, tvl } = useRootContext()
  const { connect } = useWalletConnexionContext()
  const [tab, setTab] = useState(TABS[0])

  const isStake = currentFeature === "stake"
  const inAsset = isStake ? "USG" : "sUSG"
  const outAsset = isStake ? "sUSG" : "USG"

  const sUSGBalance = useMemo(() => Number(formatUnits(USGsUSGMetrics?.sUSGBalance ?? 0n, 18)), [USGsUSGMetrics?.sUSGBalance])
  const addLiq = weiValue ? Number(formatUnits(weiValue, 18)) : 0
  const hasPosition = sUSGBalance > 0
  const typing = !!weiValue && weiValue > 0n
  const balance = USGsUSGMetrics?.sUSGBalance ?? 0n

  const rows = [
    {
      label: "sUSG balance",
      now: formatNumber(sUSGBalance, 0),
      after: formatNumber(computeProjectedValue >= 0 ? computeProjectedValue : 0, 0),
      logo: "sUSG",
    },
    {
      label: "Earned in 30 days",
      now: computeProjection(balance, 1 / 12, sUSGCurrentAPY, currentFeature),
      after: computeProjection(balance, 1 / 12, sUSGCurrentAPY, currentFeature, weiValue),
      logo: "USG",
    },
    {
      label: "Earned in 1 year",
      now: computeProjection(balance, 1, sUSGCurrentAPY, currentFeature),
      after: computeProjection(balance, 1, sUSGCurrentAPY, currentFeature, weiValue),
      logo: "USG",
    },
  ]

  return (
    <div className="mx-auto w-full max-w-[1264px] pb-20 pt-2 font-sans">
      <h1 className="text-[32px] font-semibold tracking-[-0.02em]">Savings</h1>
      <p className="mt-1 max-w-[720px] text-[14px] text-ink-2">
        Stake USG to receive sUSG and earn yield passively. sUSG is an ERC4626 token and can be used further in DeFi.{" "}
        <Link
          href="https://docs.tangent.finance/docs/usg/overview_usg#savings-account%E2%80%8B"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-white underline decoration-white/25 underline-offset-4 hover:decoration-white"
        >
          Learn more about sUSG <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </p>

      <div className="mt-6 grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_392px]">
        {/* left: the yield first, then the history behind it */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-hairline bg-surface">
          <div className="p-6">
            <div className="flex items-center gap-2.5">
              <TokenImage token="sUSG" size={32} className="h-7 w-7" />
              <span>
                <span className="block text-[15px] font-semibold">sUSG</span>
                <span className="block text-xs text-ink-3">Staked USG, ERC-4626 token</span>
              </span>
            </div>
            <div className="mt-6 text-[13px] text-ink-2">Current APY</div>
            <div className="mt-1 text-[56px] font-light tabular-nums leading-none tracking-[-0.03em]">
              {sUSGCurrentAPY ? `${sUSGCurrentAPY.toFixed(2)}%` : "-"}
            </div>
            <p className="mt-2 text-[13px] text-ink-2">7 days trailing APY. Paid by Tangent borrowers through interest and the rewards cut.</p>

            <SlidingTabs className="mt-6" labels={TABS} value={tab} onSwitchTab={setTab} />
            <div className="mt-5">
              {tab === "APY history" && (
                <PositionAPR apyHistory={apyHistory} fetchsUSGHistoryAPY={fetchsUSGHistoryAPY} sUSGSelectedTab={sUSGSelectedTab} apy={sUSGCurrentAPY} />
              )}
              {tab === "TVL history" && <PositionTVL tvl={tvl} />}
              {tab === "Projected earnings" &&
                (sUSGBalance > 0 || addLiq > 0 ? (
                  <ForecastGraph currentFeature={currentFeature} currentInvestment={sUSGBalance} apy={sUSGCurrentAPY} newLiquidity={addLiq} />
                ) : (
                  <div className="grid h-[18rem] place-items-center rounded-xl border border-dashed border-hairline px-6 text-center text-[13px] text-ink-3">
                    Enter an amount to stake, or connect a wallet that holds sUSG, to see how it grows at {sUSGCurrentAPY.toFixed(2)}% APY.
                  </div>
                ))}
            </div>
          </div>
          <div className="grid grid-cols-2 divide-divider border-t border-divider md:grid-cols-4 md:divide-x">
            {[
              ["sUSG price", USGsUSGMetrics ? formatDollar(formatUnits(USGsUSGMetrics.sUSGPrice || 0n, 18), 4) : "-"],
              ["Supply", USGsUSGMetrics ? `${formatMillions(Number(formatUnits(USGsUSGMetrics.sUSGSupply || 0n, 18)))} sUSG` : "-"],
              ["Your balance", `${formatNumber(sUSGBalance, 2)} sUSG`],
              ["Lockup", "None"],
            ].map(([l, v]) => (
              <div key={l} className="flex items-baseline justify-between px-5 py-3.5 text-[13px]">
                <span className="text-ink-3">{l}</span>
                <span className="font-medium tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* right: the action, then what it changes */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-hairline bg-surface p-5">
            <div role="tablist" className="flex w-full gap-1 rounded-[10px] bg-white/[0.04] p-1">
              <LargeButtonTab onClick={() => setCurrentFeature("stake")} active={isStake} label="Stake" />
              <LargeButtonTab onClick={() => setCurrentFeature("unstake")} active={!isStake} label="Unstake" />
            </div>

            <div className="mt-4 flex items-center justify-end text-xs text-ink-2">
              Max {formatBigInt(currentAssetInfo?.balance, 18, 2)} {inAsset}
            </div>
            <div className="mt-1.5 flex flex-col gap-1">
              <GenericInputAssetAmount
                inputWeiValue={weiValue}
                onValueChange={(value: bigint | undefined) => setWeiValue(value)}
                depositSelect={<StaticCardAssetInput assetName={inAsset} logoKey={inAsset} />}
                asset={currentAssetInfo?.asset}
                label={isStake ? "You deposit" : "You unstake"}
                maxAmountParams={{
                  maxWeiValue: currentAssetInfo?.balance || 0n,
                  setMaxAmount: () => {
                    setStakePercentage(100)
                    setWeiValue(currentAssetInfo?.balance)
                  },
                }}
                sliderParams={{ sliderPercentage: stakePercentage, setSliderPercentage: setStakePercentage }}
              />
              <button
                type="button"
                aria-label={isStake ? "Switch to unstake" : "Switch to stake"}
                onClick={() => setCurrentFeature(isStake ? "unstake" : "stake")}
                className="z-10 -my-3 mx-auto grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-surface text-ink-2 transition-colors hover:text-white"
              >
                <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <GenericInputAssetAmount
                inputWeiValue={expected}
                onValueChange={(value: bigint | undefined) => setWeiValue(value)}
                depositSelect={<StaticCardAssetInput assetName={outAsset} logoKey={outAsset} />}
                asset={receivedTokenInfo}
                label="You receive"
                disabled={true}
              />
            </div>

            <div className="mt-3 flex flex-col gap-3">
              {formState.errors
                .filter((e) => e.type === "form-alert")
                .map((error) => (
                  <FormAlert key={error.key} error={error} className="my-1" isLoading={isLoading} />
                ))}
              <FormButtons
                actions={{ handleApprove: isStake ? actionApprove : undefined, handleProcess: isStake ? actionStake : actionUnstake }}
                connect={connect}
                formState={formState}
                isLoading={isLoading}
                labelProcess={isStake ? "Stake" : "Unstake"}
              />
            </div>
          </div>

          {!!USGsUSGMetrics && !!sUSGCurrentAPY && sUSGCurrentAPY > 0 && (hasPosition || typing) && (
            <div className="rounded-2xl border border-hairline bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold">Your position</span>
                <span className="flex items-center gap-1.5 text-xs text-ink-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", typing ? "bg-action" : "bg-white/80")} />
                  {typing ? "Today, then after" : "Open"}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {rows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="flex items-center gap-1.5 text-ink-2">
                      <TokenImage token={r.logo} size={16} className="h-4 w-4" />
                      {r.label}
                    </span>
                    <span className="flex items-baseline gap-1.5 tabular-nums">
                      {typing && r.after !== r.now && (
                        <>
                          <span className="text-ink-3">{r.now}</span>
                          <span className="text-ink-3">→</span>
                        </>
                      )}
                      <span className="font-medium">{typing ? r.after : r.now}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
