"use client"

import { useState, useEffect } from "react"
import { Abi, Address, Hex, formatUnits, maxUint256, parseUnits, zeroAddress } from "viem"
import { dappConfig } from "@/dapp_config"
import { executeChainViewUnique, executeContractCall } from "@/services/service_rpc"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { useRootContext } from "@/components/products/root/root_context"
import { getQuote, getRoute } from "@/components/products/usg/global_quote_controller"
import { getCurveQuote, getCurveRouterRoute } from "@/components/products/usg/curve_routing_controller"
import { computedMinAmountOut } from "@/components/products/usg/record/usg_record_controller"
import { USGMarkets, USG_CONTRACT } from "@/components/products/usg/usg_repository"
import { Input } from "@/components/ui/input"
import GetActivePositionsStatusABI from "@/abi/USG/GetActivePositionsStatus.json"
import MarketExternalActionsABI from "@/abi/USG/MarketExternalActions.json"

const CHAINVIEW_ABI = GetActivePositionsStatusABI.abi as Abi
const CHAINVIEW_BYTECODE = GetActivePositionsStatusABI.bytecode as Hex
const MARKET_ACTIONS_ABI = MarketExternalActionsABI.abi as Abi

const MARKET_VIEWER_ADDRESS: Address = "0x05aFEe1B483DdA7273be250f93219b607EA2477D"

// Response from the /active-positions endpoint
type ActivePosition = {
  contractName: string
  contractAddress: string
  borrowerAddress: string
  debtShares: string
}

// AccountLiquidationInfo struct returned by the GetAccountLiquidation chainview
type AccountLiquidationInfo = {
  market: Address
  healthRatio: bigint
  userDebt: bigint
  positionValue: bigint
  collateralBalance: bigint
}

// Position enriched with its on-chain state
type LiquidationRow = ActivePosition & {
  liquidation: AccountLiquidationInfo | null
}

// API call to get all active positions
async function fetchActivePositions(): Promise<ActivePosition[]> {
  const res = await fetch(`${dappConfig.apiUrl}/active-positions`)
  if (!res.ok) {
    throw new Error(`/active-positions failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

// Chainview call to get all active positions infos
async function fetchLiquidationInfos(positions: ActivePosition[]): Promise<AccountLiquidationInfo[]> {
  if (positions.length === 0) return []

  const usersMarkets = positions.map((p) => ({
    account: p.borrowerAddress as Address,
    market: p.contractAddress as Address,
  }))

  const result = await executeChainViewUnique<AccountLiquidationInfo[]>(CHAINVIEW_ABI, CHAINVIEW_BYTECODE, [usersMarkets, MARKET_VIEWER_ADDRESS])

  return result ?? []
}

// Card displaying the liquidatable position with the largest debt + liquidation action.
function LiquidationCard({ target, onLiquidated }: { target: LiquidationRow; onLiquidated: () => void }) {
  const { walletClient, currentAddress } = useWalletConnexionContext()
  const { curveRoutes } = useRootContext()
  const info = target.liquidation!

  // Market collateral: address + decimals (source of truth = USGMarkets).
  const market = USGMarkets.find((m) => m.marketAddress.toLowerCase() === target.contractAddress.toLowerCase())
  const collatAddress = market?.collatAddress as Address | undefined
  const collatDecimals = market?.collatDecimals ?? 18

  // Collateral amount to liquidate (entered by the user, in human units).
  const [collatInput, setCollatInput] = useState("")
  const [slippage, setSlippage] = useState(0.2) // %, same default as the dapp
  const [customRouterOnly, setCustomRouterOnly] = useState(false) // when on, bypass ENSO and use the Curve router only
  const [status, setStatus] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Zap quote: collateral (tokenIn) -> USG (tokenOut) for the amount to liquidate.
  const [quotedUsgOut, setQuotedUsgOut] = useState<bigint | null>(null)
  const [priceImpact, setPriceImpact] = useState<number | null>(null)
  const [quoteType, setQuoteType] = useState<"custom" | "enso" | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)

  useEffect(() => {
    setQuotedUsgOut(null)
    setPriceImpact(null)
    setQuoteType(null)

    if (!collatAddress || !collatInput) return

    let amountIn: bigint
    try {
      amountIn = parseUnits(collatInput, collatDecimals)
    } catch {
      return
    }
    if (amountIn <= 0n) return

    let cancelled = false
    setQuoteLoading(true)

    // Debounce same as the dapp (1.2s) to avoid spamming the routers.
    const timeout = setTimeout(() => {
      // When customRouterOnly is on, quote only through the Curve router (no ENSO comparison).
      const quotePromise = customRouterOnly
        ? getCurveQuote(curveRoutes, collatAddress, USG_CONTRACT.USG, amountIn).then((r) => ({ ...r, type: "custom" as const }))
        : getQuote(amountIn, currentAddress ?? zeroAddress, USG_CONTRACT.USG, collatAddress, curveRoutes)

      quotePromise
        .then(({ quote, priceImpact: pI, type }) => {
          if (cancelled) return
          setQuotedUsgOut(quote)
          setPriceImpact(pI)
          setQuoteType(type)
        })
        .catch((e) => {
          if (cancelled) return
          console.error("Quote failed:", e)
        })
        .finally(() => {
          if (!cancelled) setQuoteLoading(false)
        })
    }, 1200)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collatInput, collatAddress, collatDecimals, currentAddress, customRouterOnly])

  const handleLiquidate = async () => {
    if (!walletClient) {
      setStatus("❌ Wallet not connected")
      return
    }

    let collatAmountToLiquidate: bigint
    try {
      collatAmountToLiquidate = parseUnits(collatInput, collatDecimals)
    } catch {
      setStatus("❌ Invalid amount")
      return
    }

    if (collatAmountToLiquidate <= 0n || collatAmountToLiquidate > info.collateralBalance) {
      setStatus("❌ Amount must be between 0 and the total collateral")
      return
    }

    if (!collatAddress) {
      setStatus("❌ Market not found (collatAddress)")
      return
    }

    if (quotedUsgOut === null || quotedUsgOut <= 0n) {
      setStatus("❌ Quote unavailable, please retry")
      return
    }

    if (!currentAddress) {
      setStatus("❌ Wallet address not found")
      return
    }

    // Extreme values on purpose because this page will be used in emergency case only and we want it to pass BY ALL MEANS
    const maxUsgToBurn = maxUint256
    const minCollatValueToLiquidate = 0n

    // minUsgOut: zap quote (collat -> USG) minus slippage.
    const minUsgOut = computedMinAmountOut(quotedUsgOut, slippage)

    setSubmitting(true)
    setStatus("Finding route…")

    let liquidationCall: { router: Address; routerCall: Hex }
    try {
      // tokenIn = collateral, tokenOut = USG. receiver = executing wallet, fromAddress = Zapper.
      // When customRouterOnly is on, route only through the Curve router (no ENSO comparison).
      const route = customRouterOnly
        ? await getCurveRouterRoute(curveRoutes, collatAddress, USG_CONTRACT.USG, collatAmountToLiquidate, minUsgOut, currentAddress)
        : await getRoute(collatAddress, USG_CONTRACT.USG, collatAmountToLiquidate, minUsgOut, currentAddress, USG_CONTRACT.ZAPPER, curveRoutes)
      liquidationCall = {
        router: route.routerAddress as Address,
        routerCall: route.data as Hex,
      }
    } catch (e) {
      console.error("getRoute failed:", e)
      setStatus(`❌ Route not found: ${e instanceof Error ? e.message : String(e)}`)
      setSubmitting(false)
      return
    }

    const liquidateIn = {
      account: target.borrowerAddress as Address,
      postLiquidate: {
        collatAmountToLiquidate,
        minUsgOut,
        maxUsgToBurn,
        minCollatAmountToLiquidate: collatAmountToLiquidate,
        isReceiptOut: false,
      },
      minCollatValueToLiquidate,
    }

    setStatus("Sending transaction…")
    try {
      const hash = await executeContractCall(walletClient, {
        address: target.contractAddress as Address,
        abi: MARKET_ACTIONS_ABI,
        functionName: "liquidate",
        args: [liquidateIn, liquidationCall],
      })
      setStatus(`✅ Liquidation sent: ${hash}`)
      onLiquidated()
    } catch (e) {
      console.error("Liquidation failed:", e)
      setStatus(`❌ Error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ border: "1px solid #ff6b6b", borderRadius: 8, padding: 16, marginBottom: 24, background: "rgba(255,0,0,0.06)" }}>
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>Priority liquidatable position (largest debt)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 16px", marginBottom: 16 }}>
        <span style={{ opacity: 0.7 }}>Market</span>
        <span>
          {target.contractName} ({target.contractAddress})
        </span>
        <span style={{ opacity: 0.7 }}>Borrower</span>
        <span>{target.borrowerAddress}</span>
        <span style={{ opacity: 0.7 }}>Health Ratio</span>
        <span>{Number(formatUnits(info.healthRatio, 18)).toFixed(4)}</span>
        <span style={{ opacity: 0.7 }}>User Debt</span>
        <span>{formatUnits(info.userDebt, 18)}</span>
        <span style={{ opacity: 0.7 }}>Position Value</span>
        <span>{formatUnits(info.positionValue, 18)}</span>
        <span style={{ opacity: 0.7 }}>Collateral Balance</span>
        <span>{formatUnits(info.collateralBalance, collatDecimals)}</span>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <label>Collateral to liquidate:</label>
        <Input type="number" inputMode="decimal" value={collatInput} onChange={(e) => setCollatInput(e.target.value)} placeholder="0.0" className="w-[200px]" />
        <button
          onClick={() => setCollatInput(formatUnits(info.collateralBalance, collatDecimals))}
          className="rounded-md bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          Max
        </button>
        <label>Slippage (%):</label>
        <Input type="number" inputMode="decimal" value={slippage} onChange={(e) => setSlippage(Number(e.target.value))} className="w-[90px]" />
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={customRouterOnly} onChange={(e) => setCustomRouterOnly(e.target.checked)} />
          Custom router only
        </label>
        <button
          onClick={handleLiquidate}
          disabled={submitting}
          className="rounded-md bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 disabled:opacity-50"
        >
          {submitting ? "Liquidating…" : "Liquidate"}
        </button>
      </div>

      {/* Zap quote result: collateral -> USG */}
      <div style={{ marginTop: 8, opacity: 0.85 }}>
        {quoteLoading ? (
          <span>Fetching quote…</span>
        ) : quotedUsgOut !== null ? (
          <span>
            Quote: ≈ <strong>{formatUnits(quotedUsgOut, 18)}</strong> USG
            {quoteType !== null && <> · source {quoteType === "enso" ? "ENSO" : "Custom (Curve/Pendle)"}</>}
            {priceImpact !== null && <> · price impact {(priceImpact / 100).toFixed(2)}%</>}
          </span>
        ) : (
          <span style={{ opacity: 0.6 }}>Enter an amount to get a quote.</span>
        )}
      </div>

      {status && <div style={{ marginTop: 8, wordBreak: "break-all" }}>{status}</div>}
    </div>
  )
}

type SortKey = "market" | "borrower" | "healthRatio" | "userDebt" | "positionValue" | "collateralBalance"
type SortDir = "asc" | "desc"

const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: "market", label: "Market" },
  { key: "borrower", label: "Borrower" },
  { key: "healthRatio", label: "Health Ratio" },
  { key: "userDebt", label: "User Debt" },
  { key: "positionValue", label: "Position Value" },
  { key: "collateralBalance", label: "Collateral" },
]

// Comparable value for a row given a sort key (string for text columns, bigint for on-chain values).
function sortValue(row: LiquidationRow, key: SortKey): string | bigint {
  switch (key) {
    case "market":
      return row.contractName.toLowerCase()
    case "borrower":
      return row.borrowerAddress.toLowerCase()
    default:
      // On-chain numeric columns; rows without liquidation info sort as -1.
      return row.liquidation ? row.liquidation[key] : -1n
  }
}

export default function LiquidationsPage() {
  const [rows, setRows] = useState<LiquidationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("healthRatio")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const positions = await fetchActivePositions()
      const infos = await fetchLiquidationInfos(positions)

      const merged: LiquidationRow[] = positions.map((p, i) => ({
        ...p,
        liquidation: infos[i] ?? null,
      }))

      setRows(merged)
    } catch (e) {
      console.error("Failed to load liquidations:", e)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Liquidatable positions: HR < 1.
  const liquidatableRows = rows.filter((row) => row.liquidation !== null && row.liquidation.healthRatio < parseUnits("1", 18))

  // Among the liquidatable ones, the position with the largest debt.
  const bestTarget = liquidatableRows.reduce<LiquidationRow | null>((best, row) => {
    if (!best || row.liquidation!.userDebt > best.liquidation!.userDebt) return row
    return best
  }, null)

  // Clicking a column toggles the direction; clicking another column resets to ascending.
  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sortedRows = [...rows].sort((a, b) => {
    const va = sortValue(a, sortKey)
    const vb = sortValue(b, sortKey)
    let cmp: number
    if (typeof va === "string" && typeof vb === "string") {
      cmp = va.localeCompare(vb)
    } else {
      cmp = (va as bigint) < (vb as bigint) ? -1 : (va as bigint) > (vb as bigint) ? 1 : 0
    }
    return sortDir === "asc" ? cmp : -cmp
  })

  return (
    <div style={{ padding: 24, color: "#eee", fontFamily: "monospace" }}>
      <h1 style={{ marginBottom: 16 }}>Liquidations</h1>

      <button onClick={load} disabled={loading} style={{ marginBottom: 16 }}>
        {loading ? "Loading…" : "Refresh"}
      </button>

      {error && <div style={{ color: "#ff6b6b", marginBottom: 16 }}>Error: {error}</div>}

      {bestTarget && <LiquidationCard target={bestTarget} onLiquidated={load} />}

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #444" }}>
            {SORT_COLUMNS.map((col) => (
              <th key={col.key} style={{ padding: 8, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort(col.key)}>
                {col.label}
                {sortKey === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, i) => {
            const hr = row.liquidation ? Number(formatUnits(row.liquidation.healthRatio, 18)) : null
            const liquidatable = hr !== null && hr < 1
            return (
              <tr
                key={`${row.contractAddress}-${row.borrowerAddress}-${i}`}
                style={{ borderBottom: "1px solid #2a2a2a", background: liquidatable ? "rgba(255,0,0,0.08)" : undefined }}
              >
                <td style={{ padding: 8 }}>{row.contractName}</td>
                <td style={{ padding: 8 }}>{row.borrowerAddress}</td>
                <td style={{ padding: 8 }}>{hr !== null ? hr.toFixed(4) : "—"}</td>
                <td style={{ padding: 8 }}>{row.liquidation ? formatUnits(row.liquidation.userDebt, 18) : "—"}</td>
                <td style={{ padding: 8 }}>{row.liquidation ? formatUnits(row.liquidation.positionValue, 18) : "—"}</td>
                <td style={{ padding: 8 }}>{row.liquidation ? formatUnits(row.liquidation.collateralBalance, 18) : "—"}</td>
              </tr>
            )
          })}
          {rows.length === 0 && !loading && (
            <tr>
              <td colSpan={6} style={{ padding: 8, opacity: 0.6 }}>
                No active positions.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
