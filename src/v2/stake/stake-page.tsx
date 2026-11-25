"use client"

import { Roll } from "@/v2/ui/roll"
import { ActionSheet, MobileActionBar, useIsDesktop } from "@/v2/ui/mobile-action-bar"
import { VoidTexture } from "@/v2/ui/void-texture"
import Link from "next/link"
import { useMemo, useState } from "react"
import { formatUnits } from "viem"
import { ArrowDown, ArrowRight, ArrowUpRight, CircleCheck } from "lucide-react"
import { StatusChip } from "@/v2/ui/status-chip"
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
    vault,
  } = useUSGStakeContext()
  const root = useRootContext()
  // same rule as the live content: only sUSG has an APY and a TVL history for now
  const sUSGCurrentAPY = vault.hasData ? root.sUSGCurrentAPY : 0
  const tvl = vault.hasData ? root.tvl : []
  const share = vault.share.symbol
  const asset = vault.asset.symbol
  const { connect } = useWalletConnexionContext()
  const [tab, setTab] = useState(TABS[0])
  const isDesktop = useIsDesktop()
  const [sheet, setSheet] = useState(false)

  const isStake = currentFeature === "stake"
  const inAsset = isStake ? asset : share
  const outAsset = isStake ? share : asset
  const inLogo = isStake ? vault.asset.logo : vault.share.logo
  const outLogo = isStake ? vault.share.logo : vault.asset.logo

  const sUSGBalance = useMemo(() => Number(formatUnits(USGsUSGMetrics?.sUSGBalance ?? 0n, 18)), [USGsUSGMetrics?.sUSGBalance])
  const addLiq = weiValue ? Number(formatUnits(weiValue, 18)) : 0
  const hasPosition = sUSGBalance > 0
  const typing = !!weiValue && weiValue > 0n
  const balance = USGsUSGMetrics?.sUSGBalance ?? 0n

  const rows = [
    {
      label: `${share} balance`,
      now: formatNumber(sUSGBalance, 0),
      after: formatNumber(computeProjectedValue >= 0 ? computeProjectedValue : 0, 0),
      logo: vault.share.logo,
    },
    {
      label: "Earned in 30 days",
      now: computeProjection(balance, 1 / 12, sUSGCurrentAPY, currentFeature),
      after: computeProjection(balance, 1 / 12, sUSGCurrentAPY, currentFeature, weiValue),
      logo: vault.asset.logo,
    },
    {
      label: "Earned in 1 year",
      now: computeProjection(balance, 1, sUSGCurrentAPY, currentFeature),
      after: computeProjection(balance, 1, sUSGCurrentAPY, currentFeature, weiValue),
      logo: vault.asset.logo,
    },
  ]

  const form = (
    <>
      <div role="tablist" className="flex w-full gap-1 rounded-[10px] bg-white/[0.04] p-1">
        <LargeButtonTab onClick={() => setCurrentFeature("stake")} active={isStake} label={vault.depositLabel} />
        <LargeButtonTab onClick={() => setCurrentFeature("unstake")} active={!isStake} label={vault.withdrawLabel} />
      </div>

      <div className="mt-4 flex items-center justify-end text-xs text-ink-2">
        Max {formatBigInt(currentAssetInfo?.balance, 18, 2)} {inAsset}
      </div>
      <div className="mt-1.5 flex flex-col gap-1">
        <GenericInputAssetAmount
          inputWeiValue={weiValue}
          onValueChange={(value: bigint | undefined) => setWeiValue(value)}
          depositSelect={<StaticCardAssetInput assetName={inAsset} logoKey={inLogo} />}
          asset={currentAssetInfo?.asset}
          label={isStake ? "You deposit" : `You ${vault.withdrawLabel.toLowerCase()}`}
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
          aria-label={`Switch to ${(isStake ? vault.withdrawLabel : vault.depositLabel).toLowerCase()}`}
          onClick={() => setCurrentFeature(isStake ? "unstake" : "stake")}
          className="z-10 -my-3 mx-auto grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-surface text-ink-2 transition-colors hover:text-white"
        >
          <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <GenericInputAssetAmount
          inputWeiValue={expected}
          onValueChange={(value: bigint | undefined) => setWeiValue(value)}
          depositSelect={<StaticCardAssetInput assetName={outAsset} logoKey={outLogo} />}
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
          labelProcess={isStake ? vault.depositLabel : vault.withdrawLabel}
        />
      </div>
    </>
  )

  return (
    <div className="w-full pb-20 pt-2 font-sans">
      <div className="text-[13px] text-ink-3">
        <Link href="/stake" className="hover:text-white">
          Savings
        </Link>{" "}
        / <span className="text-ink-2">{vault.key}</span>
      </div>
      <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.02em]">{vault.title}</h1>
      <p className="mt-1 max-w-[720px] text-[14px] text-ink-2">
        {vault.description}{" "}
        <Link
          href={vault.docsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-white underline decoration-white/25 underline-offset-4 hover:decoration-white"
        >
          {vault.docsLabel} <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </p>

      <div className="mt-6 grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_392px]">
        {/* left: the yield first, then the history behind it */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-hairline bg-surface">
          <div className="relative isolate overflow-hidden p-6">
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[260px]">
              <VoidTexture id="savings-hero" />
            </span>
            <div className="flex items-center gap-2.5">
              <TokenImage token={vault.share.logo} size={32} className="h-7 w-auto" />
              <span>
                <span className="block text-[15px] font-semibold">{share}</span>
                <span className="block text-xs text-ink-3">
                  {vault.subtitle} · {vault.source}
                </span>
              </span>
            </div>
            {/* the yield on the left, the vault facts beside it (same reading as the market facts), under it on narrow cards */}
            <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <div className="shrink-0">
                <div className="text-[13px] text-ink-2">Current APY</div>
                <div className="mt-1 text-[56px] font-light tabular-nums leading-none tracking-[-0.03em]">
                  <Roll value={sUSGCurrentAPY ? `${sUSGCurrentAPY.toFixed(2)}%` : "-"} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-4 sm:gap-y-0 lg:w-[300px] lg:shrink-0 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-3">
                {[
                  [`${share} price`, USGsUSGMetrics ? formatDollar(formatUnits(USGsUSGMetrics.sUSGPrice || 0n, 18), 4) : "-"],
                  ["Supply", USGsUSGMetrics ? `${formatMillions(Number(formatUnits(USGsUSGMetrics.sUSGSupply || 0n, 18)))} ${share}` : "-"],
                  ["Your balance", `${formatNumber(sUSGBalance, 2)} ${share}`],
                  ["Lockup", "None"],
                ].map(([l, v]) => (
                  <div
                    key={l}
                    className="min-w-0 pr-3 sm:border-l sm:border-divider sm:px-4 sm:first:border-l-0 sm:first:pl-0 sm:last:pr-0 lg:border-l-0 lg:px-0"
                  >
                    <div className="whitespace-nowrap text-xs text-ink-3">{l}</div>
                    <div className="mt-1 truncate text-[15px] font-medium tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-[13px] text-ink-2">
              {vault.hasData
                ? "7 days trailing APY. Paid by Tangent borrowers through interest and the rewards cut."
                : "APY and history for this vault are not available yet."}
            </p>

            <SlidingTabs className="mt-6" labels={TABS} value={tab} onSwitchTab={setTab} />
            <div className="mt-5">
              {!vault.hasData && tab !== "Projected earnings" && (
                <div className="grid h-[18rem] place-items-center rounded-xl border border-dashed border-hairline px-6 text-center text-[13px] text-ink-3">
                  No history for this vault yet.
                </div>
              )}
              {vault.hasData && tab === "APY history" && (
                <PositionAPR apyHistory={apyHistory} fetchsUSGHistoryAPY={fetchsUSGHistoryAPY} sUSGSelectedTab={sUSGSelectedTab} apy={sUSGCurrentAPY} />
              )}
              {vault.hasData && tab === "TVL history" && <PositionTVL tvl={tvl} />}
              {tab === "Projected earnings" &&
                (vault.hasData && (sUSGBalance > 0 || addLiq > 0) ? (
                  <ForecastGraph currentFeature={currentFeature} currentInvestment={sUSGBalance} apy={sUSGCurrentAPY} newLiquidity={addLiq} />
                ) : (
                  <div className="grid h-[18rem] place-items-center rounded-xl border border-dashed border-hairline px-6 text-center text-[13px] text-ink-3">
                    {vault.hasData
                      ? `Enter an amount to stake, or connect a wallet that holds ${share}, to see how it grows at ${sUSGCurrentAPY.toFixed(2)}% APY.`
                      : "Projections need the vault APY, not available yet."}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* right: the action, then what it changes */}
        <div className="flex flex-col gap-4">
          {isDesktop && <div className="hidden rounded-2xl border border-hairline bg-surface p-5 xl:block">{form}</div>}

          {!!USGsUSGMetrics && !!sUSGCurrentAPY && sUSGCurrentAPY > 0 && (hasPosition || typing) && (
            <div className="rounded-2xl border border-hairline bg-surface p-5">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold">Your position</span>
                <StatusChip icon={typing ? <ArrowRight className="text-action" strokeWidth={2} /> : <CircleCheck strokeWidth={2} />}>
                  {typing ? "Today, then after" : "Open"}
                </StatusChip>
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
                      <Roll className="font-medium" value={typing ? r.after : r.now} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {!isDesktop && (
        <>
          <MobileActionBar
            title={share}
            sub={sUSGCurrentAPY ? `APY ${sUSGCurrentAPY.toFixed(2)}%` : undefined}
            actions={[
              {
                label: vault.withdrawLabel,
                onClick: () => {
                  setCurrentFeature("unstake")
                  setSheet(true)
                },
              },
              {
                label: vault.depositLabel,
                primary: true,
                onClick: () => {
                  setCurrentFeature("stake")
                  setSheet(true)
                },
              },
            ]}
          />
          <ActionSheet open={sheet} onClose={() => setSheet(false)} title={vault.title}>
            {form}
          </ActionSheet>
        </>
      )}
    </div>
  )
}
