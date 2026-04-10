"use client"

import { useState, useEffect, useCallback } from "react"
import { createPublicClient, http, Address } from "viem"
import { dappConfig } from "@/dapp_config"
import { USGMarkets } from "@/components/products/usg/usg_repository"
import IRCalculatorABI from "@/abi/USG/IRCalculator.json"
import { Abi } from "viem"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { executeContractCall } from "@/services/service_rpc"

const IR_CALCULATOR_ABI = IRCalculatorABI.abi as Abi

const addresses = process.env.NEXT_PUBLIC_ADDRESSES_JSON
const envAddresses = addresses ? JSON.parse(addresses) : {}
const IR_CALCULATOR_ADDRESS: Address = envAddresses?.utilities?.irCalculator

const RAY = BigInt("1000000000000000000000000000") // 1e27

function formatRay(value: bigint): string {
  const whole = value / RAY
  const fractional = value % RAY
  const fractionalStr = fractional.toString().padStart(27, "0").slice(0, 6)
  return `${whole}.${fractionalStr}`
}

async function rpcRequest(method: string, params: unknown[]) {
  const res = await fetch(dappConfig.chain.rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  })
  return res.json()
}

const publicClient = createPublicClient({
  chain: {
    id: dappConfig.chain.id,
    name: dappConfig.chain.name,
    nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" },
    rpcUrls: { default: { http: [dappConfig.chain.rpc] } },
  },
  transport: http(dappConfig.chain.rpc),
})

type DebtIndexRow = {
  marketName: string
  marketAddress: Address
  index: bigint | null
  error: string | null
}

export default function DevToolsPage() {
  const { walletClient } = useWalletConnexionContext()

  const [hours, setHours] = useState<string>("1")
  const [mineStatus, setMineStatus] = useState<string>("")
  const [isMining, setIsMining] = useState(false)
  const [lastBlockTime, setLastBlockTime] = useState<Date | null>(null)

  const [debtIndexes, setDebtIndexes] = useState<DebtIndexRow[]>([])
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(false)

  const [selected, setSelected] = useState<Set<Address>>(new Set())
  const [isCheckpointing, setIsCheckpointing] = useState(false)
  const [checkpointStatus, setCheckpointStatus] = useState<string>("")

  const allAddresses = debtIndexes.map((r) => r.marketAddress)
  const allSelected = allAddresses.length > 0 && allAddresses.every((a) => selected.has(a))

  const toggleRow = (addr: Address) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(addr)) {
        next.delete(addr)
      } else {
        next.add(addr)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allAddresses))
    }
  }

  const fetchLastBlockTime = useCallback(async () => {
    try {
      const block = await publicClient.getBlock({ blockTag: "latest" })
      setLastBlockTime(new Date(Number(block.timestamp) * 1000))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchLastBlockTime()
  }, [fetchLastBlockTime])

  const handleMineBlock = async () => {
    const hoursNum = parseFloat(hours)
    if (isNaN(hoursNum) || hoursNum <= 0) {
      setMineStatus("Invalid hours value")
      return
    }

    setIsMining(true)
    setMineStatus("")

    try {
      const seconds = Math.floor(hoursNum * 3600)
      await rpcRequest("evm_increaseTime", [seconds])
      const mineResult = await rpcRequest("evm_mine", [])
      if (mineResult.error) {
        setMineStatus(`Error: ${mineResult.error.message}`)
      } else {
        setMineStatus(`Mined block. Time advanced by ${hoursNum}h (${seconds}s).`)
        await fetchLastBlockTime()
      }
    } catch (e) {
      setMineStatus(`Error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setIsMining(false)
    }
  }

  const fetchDebtIndexes = useCallback(async () => {
    if (!IR_CALCULATOR_ADDRESS) return

    setIsLoadingIndexes(true)

    const results = await Promise.all(
      USGMarkets.map(async (market) => {
        try {
          const index = (await publicClient.readContract({
            address: IR_CALCULATOR_ADDRESS,
            abi: IR_CALCULATOR_ABI,
            functionName: "debtIndexes",
            args: [market.marketAddress],
          })) as bigint

          return { marketName: market.marketName, marketAddress: market.marketAddress, index, error: null }
        } catch (e) {
          return {
            marketName: market.marketName,
            marketAddress: market.marketAddress,
            index: null,
            error: e instanceof Error ? e.message : String(e),
          }
        }
      })
    )

    setDebtIndexes(results)
    setIsLoadingIndexes(false)
  }, [])

  useEffect(() => {
    fetchDebtIndexes()
  }, [fetchDebtIndexes])

  const handleCheckpoint = async () => {
    if (!walletClient || selected.size === 0 || !IR_CALCULATOR_ADDRESS) return

    setIsCheckpointing(true)
    setCheckpointStatus("")

    try {
      const markets = Array.from(selected)
      const hash = await executeContractCall(walletClient, {
        address: IR_CALCULATOR_ADDRESS,
        abi: IR_CALCULATOR_ABI,
        functionName: "checkpointIRMulti",
        args: [markets],
      })
      setCheckpointStatus(`Checkpoint sent: ${hash}`)
      await fetchDebtIndexes()
    } catch (e) {
      setCheckpointStatus(`Error: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setIsCheckpointing(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <h1 className="text-xl font-bold text-white">DevTools — Hardhat</h1>

      {/* Mine Block */}
      <div className="flex flex-col gap-3 rounded-[10px] bg-overlay-panel p-5">
        <div className="flex items-baseline gap-4">
          <h2 className="font-semibold text-white">Advance Time & Mine Block</h2>
          {lastBlockTime && (
            <span className="text-xs text-white/50">
              Last block: <span className="text-white/70">{lastBlockTime.toLocaleString()}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-32 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/40"
            placeholder="Hours"
          />
          <span className="text-sm text-white/60">hours</span>
          <button onClick={handleMineBlock} disabled={isMining} className="rounded-md bg-tonic px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">
            {isMining ? "Mining..." : "Mine Block"}
          </button>
        </div>
        {mineStatus && <p className="text-sm text-white/70">{mineStatus}</p>}
      </div>

      {/* Debt Indexes */}
      <div className="flex flex-col gap-3 rounded-[10px] bg-overlay-panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">IRCalculator — debtIndexes</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAll}
              disabled={debtIndexes.length === 0}
              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-50"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            <button
              onClick={handleCheckpoint}
              disabled={isCheckpointing || selected.size === 0 || !walletClient}
              className="rounded-md bg-tonic px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
            >
              {isCheckpointing ? "Checkpointing..." : `Checkpoint (${selected.size})`}
            </button>
            <button
              onClick={fetchDebtIndexes}
              disabled={isLoadingIndexes}
              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-50"
            >
              {isLoadingIndexes ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {checkpointStatus && (
          <p className={`break-all text-xs ${checkpointStatus.startsWith("Error") ? "text-red-400" : "text-white/70"}`}>{checkpointStatus}</p>
        )}

        {!IR_CALCULATOR_ADDRESS && <p className="text-sm text-red-400">IRCalculator address not found in NEXT_PUBLIC_ADDRESSES_JSON</p>}

        {isLoadingIndexes && debtIndexes.length === 0 && <p className="text-sm text-white/50">Loading indexes...</p>}

        {debtIndexes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
                  <th className="w-4 pb-2 pr-3 font-medium"></th>
                  <th className="pb-2 pr-4 font-medium">Market</th>
                  <th className="pb-2 pr-4 font-medium">Address</th>
                  <th className="pb-2 font-medium">Debt Index (27 dec)</th>
                </tr>
              </thead>
              <tbody>
                {debtIndexes.map((row) => {
                  const isSelected = selected.has(row.marketAddress)
                  return (
                    <tr
                      key={row.marketAddress}
                      onClick={() => toggleRow(row.marketAddress)}
                      className={`cursor-pointer border-b border-white/5 transition-colors ${isSelected ? "bg-white/5" : "hover:bg-white/[0.03]"}`}
                    >
                      <td className="py-2 pr-3">
                        <div className={`h-4 w-4 rounded border transition-colors ${isSelected ? "border-tonic bg-tonic" : "border-white/30 bg-transparent"}`}>
                          {isSelected && (
                            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                              <path d="M3 8l3.5 3.5L13 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-white">{row.marketName}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-white/50">
                        {row.marketAddress.slice(0, 8)}...{row.marketAddress.slice(-6)}
                      </td>
                      <td className="py-2">
                        {row.error ? (
                          <span className="text-xs text-red-400">{row.error}</span>
                        ) : row.index !== null ? (
                          <div className="flex flex-col">
                            <span className="text-white">{formatRay(row.index)}</span>
                            <span className="text-xs text-white/40">{row.index.toString()}</span>
                          </div>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
