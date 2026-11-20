"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { formatUnits, zeroAddress } from "viem"
import { USGStakingInfo } from "../usg_type"
import { useUSGContext } from "../usg_context"
import { getYearnV3Metrics } from "./usg_stake_controller"
import { SAVINGS_VAULTS, SavingsVault } from "./savings_vaults"
import { formatDollar, formatMillions } from "@/lib/number_formatter"
import { IconOpenOutside } from "@/components/icons"
import { useRootContext } from "@/components/products/root/root_context"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { PageHeader } from "@/components/design_system/structure/page_header"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { FeatureBannerCarousel } from "@/components/design_system/structure/feature_banner_carousel"
import { ThreeCardRowWithMask } from "@/components/design_system/structure/three_cards_with_background_and_neon"

const VAULTS = Object.values(SAVINGS_VAULTS)

// value in USD of `amount` shares priced at `price` (both 18 decimals)
const toUsd = (amount?: bigint, price?: bigint) => Number(formatUnits(((amount ?? 0n) * (price ?? 0n)) / 10n ** 18n, 18))

export default function SavingsProducts() {
  const { currentAddress } = useWalletConnexionContext()
  const { USGsUSGMetrics } = useUSGContext()
  const { sUSGCurrentAPY } = useRootContext()
  const [yearnMetrics, setYearnMetrics] = useState<Partial<Record<SavingsVault["key"], USGStakingInfo>>>({})

  useEffect(() => {
    const yearnVaults = VAULTS.filter((v) => v.source === "Yearn V3")
    Promise.all(yearnVaults.map((v) => getYearnV3Metrics(currentAddress || zeroAddress, v.asset.address, v.share.address)))
      .then((metrics) => setYearnMetrics(Object.fromEntries(yearnVaults.map((v, i) => [v.key, metrics[i]]))))
      .catch((error) => console.error("Failed to load savings vaults metrics:", error))
  }, [currentAddress])

  const metricsOf = (vault: SavingsVault) => (vault.source === "Tangent" ? USGsUSGMetrics : yearnMetrics[vault.key])
  // ponytail: no APY backend for Yearn V3 vaults yet, shown as "-"
  const apyOf = (vault: SavingsVault) => (vault.hasData ? sUSGCurrentAPY : undefined)
  const tvlOf = (vault: SavingsVault) => toUsd(metricsOf(vault)?.sUSGSupply, metricsOf(vault)?.sUSGPrice)

  const totalTvl = VAULTS.reduce((sum, v) => sum + tvlOf(v), 0)
  const bestApy = Math.max(0, ...VAULTS.map((v) => apyOf(v) ?? 0))
  const deposits = VAULTS.reduce((sum, v) => sum + toUsd(metricsOf(v)?.sUSGBalance, metricsOf(v)?.sUSGPrice), 0)

  const sUSG = SAVINGS_VAULTS.sUSG

  return (
    <>
      <div className="flex items-stretch justify-between gap-5">
        <PageHeader>
          <Image height={150} width={150} src={sUSG.image} alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          <div className="flex flex-col items-start justify-center px-6">
            <span className="text-4xl font-semibold">Savings products</span>
            <p className="mt-2 text-[15px]">
              Explore Tangent&apos;s savings products. All products are ERC4626 tokens and can be used further in DeFi.{" "}
              <Link className="inline-flex items-center underline hover:text-white/30" href={sUSG.docsHref} target="_blank" rel="noopener noreferrer">
                Learn more <IconOpenOutside className="ml-1 w-3 fill-white" />
              </Link>
            </p>
          </div>
        </PageHeader>

        <div className="flex h-auto w-full flex-col justify-between gap-[10px] xl:w-1/2">
          <FeatureBannerCarousel />
          <ThreeCardRowWithMask
            contents={[
              { key: "Total TVL", value: `$${formatMillions(totalTvl)}` },
              { key: "Best APY", value: `${bestApy.toFixed(2)}%` },
              { key: "Your deposits", value: formatDollar(deposits) },
            ]}
          />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-[28px] font-semibold tracking-[-0.01em]">Savings products</h2>
        <p className="mt-1 text-[15px] text-white/60">Stake USG directly, or pick a Yearn V3 vault that auto-compounds a USG pool.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {VAULTS.map((vault) => (
          <SavingsProductCard key={vault.key} vault={vault} apy={apyOf(vault)} tvl={tvlOf(vault)} />
        ))}
      </div>
    </>
  )
}

function SavingsProductCard({ vault, apy, tvl }: { vault: SavingsVault; apy?: number; tvl: number }) {
  return (
    <Link href={`/stake/${vault.key}`} className="group relative flex flex-col overflow-hidden rounded-[10px] bg-white/[0.03] p-[19px] backdrop-blur-[30px]">
      {/* hover glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: "radial-gradient(55.5% 45.5% at 50% 0%, rgba(0,117,255,0.55) 0%, rgba(0,117,255,0) 100%)" }}
      />
      {/* 1px gradient stroke (default: white fading down, hover: blue top) */}
      {[
        { className: "group-hover:opacity-0", background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)" },
        {
          className: "opacity-0 group-hover:opacity-100",
          background: "linear-gradient(180deg, #0075FF 0%, rgba(0,117,255,0.2) 40%, rgba(255,255,255,0.05) 100%)",
        },
      ].map(({ className, background }) => (
        <div
          key={className}
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-[10px] p-px transition-opacity ${className}`}
          style={{
            background,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      ))}

      <div className="relative flex items-start gap-[14px]">
        <TokenImage token={vault.share.logo} size={48} className="size-10 shrink-0" />
        <div className="flex-1">
          <p className="text-xl font-semibold tracking-[-0.01em]">{vault.key}</p>
          <p className="text-[13px] text-white/55">{vault.subtitle}</p>
        </div>
      </div>

      <p className="relative mt-4 min-h-10 text-sm leading-5 text-white/70">{vault.summary}</p>

      <div className="relative mt-4 grid grid-cols-2 gap-2">
        <div className="h-[68px] rounded-lg bg-white/[0.04] px-[14px] py-3">
          <p className="text-xs text-white/55">APY</p>
          <p className="mt-0.5 text-[28px] font-semibold leading-none tracking-[-0.01em]">{apy === undefined ? "-" : `${apy.toFixed(2)}%`}</p>
        </div>
        <div className="h-[68px] rounded-lg bg-white/[0.04] px-[14px] py-3">
          <p className="text-xs text-white/55">TVL</p>
          <p className="mt-2 text-xl font-medium tracking-[-0.01em] opacity-85">${formatMillions(tvl)}</p>
        </div>
      </div>

      <div className="relative mt-4 h-px bg-white/[0.08]" />

      <div className="relative mt-2 flex items-center justify-between">
        <p className="text-sm">
          <span className="font-semibold">{vault.source === "Tangent" ? "Stake USG" : "Deposit"}</span>
          {vault.depositTokens && <span className="ml-2 text-white/55">{vault.depositTokens}</span>}
        </p>
        <span className="relative size-8">
          <Image src="/medias/savings/go.svg" alt="" width={32} height={32} className="absolute inset-0 group-hover:opacity-0" />
          <Image src="/medias/savings/go_active.svg" alt="" width={32} height={32} className="absolute inset-0 opacity-0 group-hover:opacity-100" />
        </span>
      </div>
    </Link>
  )
}
