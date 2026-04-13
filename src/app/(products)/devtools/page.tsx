"use client"

import { useState, useEffect, useCallback } from "react"
import { createPublicClient, http, Address, formatUnits, formatEther, zeroAddress } from "viem"
import { dappConfig } from "@/dapp_config"
import { USGMarkets } from "@/components/products/usg/usg_repository"
import IRCalculatorABI from "@/abi/USG/IRCalculator.json"
import { Abi } from "viem"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { executeContractCall } from "@/services/service_rpc"

const IR_CALCULATOR_ABI = IRCalculatorABI.abi as Abi

const CURVE_LP_ABI: Abi = [
  { name: "name", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "coins", type: "function", stateMutability: "view", inputs: [{ name: "i", type: "uint256" }], outputs: [{ type: "address" }] },
  { name: "price_oracle", type: "function", stateMutability: "view", inputs: [{ name: "k", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { name: "get_p", type: "function", stateMutability: "view", inputs: [{ name: "i", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { name: "get_virtual_price", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
] as const

const ERC20_ABI: Abi = [
  { name: "symbol", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
] as const

const MARKET_ABI: Abi = [
  { name: "userDebtShares", type: "function", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "totalDebtShares", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const

const addresses = process.env.NEXT_PUBLIC_ADDRESSES_JSON
const envAddresses = addresses ? JSON.parse(addresses) : {}
const IR_CALCULATOR_ADDRESS: Address = envAddresses?.utilities?.irCalculator

const LP_ADDRESSES: { name: string; address: Address }[] = [
  { name: "USG-USDC", address: envAddresses?.lps?.["USG-USDC"] },
  { name: "USG-frxUSD", address: envAddresses?.lps?.["USG-frxUSD"] },
].filter((lp) => !!lp.address)

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

type LpRow = {
  name: string
  virtualPrice: string
  priceOracle: string
  lastPrice: string
  coin0: string
  balance0: number
  coin1: string
  balance1: number
}

type DebtIndexRow = {
  marketName: string
  marketAddress: Address
  index: bigint | null
  userDebtShares: bigint | null
  totalDebtShares: bigint | null
  error: string | null
}

function formatStablePrice(value: bigint): string {
  return Number(formatUnits(value, 18)).toFixed(6)
}

export default function DevToolsPage() {
  const { walletClient, currentAddress } = useWalletConnexionContext()

  const [hours, setHours] = useState<string>("1")
  const [mineStatus, setMineStatus] = useState<string>("")
  const [isMining, setIsMining] = useState(false)
  const [lastBlockTime, setLastBlockTime] = useState<Date | null>(null)

  const [debtIndexes, setDebtIndexes] = useState<DebtIndexRow[]>([])
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(false)

  const [lpRows, setLpRows] = useState<LpRow[]>([])
  const [isLoadingLps, setIsLoadingLps] = useState(false)

  const [selected, setSelected] = useState<Set<Address>>(new Set())
  const [isCheckpointing, setIsCheckpointing] = useState(false)
  const [checkpointStatus, setCheckpointStatus] = useState<string>("")
  // Nouvel état pour la valeur globale
  const [mintableInterests, setMintableInterests] = useState<bigint | null>(null)

  const allAddresses = debtIndexes.map((r) => r.marketAddress)
  const allSelected = allAddresses.length > 0 && allAddresses.every((a) => selected.has(a))

  const fetchDebtIndexes = async () => {
    if (!IR_CALCULATOR_ADDRESS || currentAddress === zeroAddress) {
      return
    }

    setIsLoadingIndexes(true)

    try {
      const results: DebtIndexRow[] = []

      for (const market of USGMarkets) {
        try {
          // Debt Index depuis IRCalculator
          const index = (await publicClient.readContract({
            address: IR_CALCULATOR_ADDRESS,
            abi: IR_CALCULATOR_ABI,
            functionName: "debtIndexes",
            args: [market.marketAddress],
          })) as bigint

          // User Debt Shares (seulement si wallet connecté)
          let userDebtShares: bigint | null = null
          if (currentAddress) {
            userDebtShares = (await publicClient.readContract({
              address: market.marketAddress,
              abi: MARKET_ABI,
              functionName: "userDebtShares",
              args: [currentAddress],
            })) as bigint
          }

          // Total Debt Shares
          const totalDebtShares = (await publicClient.readContract({
            address: market.marketAddress,
            abi: MARKET_ABI,
            functionName: "totalDebtShares",
          })) as bigint

          results.push({
            marketName: market.marketName,
            marketAddress: market.marketAddress,
            index,
            userDebtShares,
            totalDebtShares,
            error: null,
          })
        } catch (err) {
          console.error(`Error fetching data for market ${market.marketName}:`, err)

          results.push({
            marketName: market.marketName,
            marketAddress: market.marketAddress,
            index: null,
            userDebtShares: null,
            totalDebtShares: null,
            error: err instanceof Error ? err.message : String(err),
          })
        }
      }

      // Mintable Interests (global)
      let mintableInterests: bigint | null = null
      try {
        mintableInterests = (await publicClient.readContract({
          address: IR_CALCULATOR_ADDRESS,
          abi: IR_CALCULATOR_ABI,
          functionName: "mintableInterests",
        })) as bigint
      } catch (err) {
        console.error("Error fetching mintableInterests:", err)
      }

      setDebtIndexes(results)
      setMintableInterests(mintableInterests)
    } catch (e) {
      console.error("Unexpected error in fetchDebtIndexes:", e)
    } finally {
      setIsLoadingIndexes(false)
    }
  }

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

  const fetchLpData = useCallback(async () => {
    setIsLoadingLps(true)
    const results = await Promise.all(
      LP_ADDRESSES.map(async ({ address: lpAddress }) => {
        const readLp = (functionName: string, args?: unknown[]) => publicClient.readContract({ address: lpAddress, abi: CURVE_LP_ABI, functionName, args })

        const readErc20 = (addr: Address, functionName: string, args?: unknown[]) =>
          publicClient.readContract({ address: addr, abi: ERC20_ABI, functionName, args })

        const [lpName, coin0Addr, coin1Addr, virtualPrice, priceOracle, lastPrice] = await Promise.all([
          readLp("name") as Promise<string>,
          readLp("coins", [0n]) as Promise<Address>,
          readLp("coins", [1n]) as Promise<Address>,
          readLp("get_virtual_price") as Promise<bigint>,
          readLp("price_oracle", [0n]) as Promise<bigint>,
          readLp("get_p", [0n]) as Promise<bigint>,
        ])

        const [[symbol0, balance0Raw, decimals0], [symbol1, balance1Raw, decimals1]] = await Promise.all([
          Promise.all([
            readErc20(coin0Addr, "symbol") as Promise<string>,
            readErc20(coin0Addr, "balanceOf", [lpAddress]) as Promise<bigint>,
            readErc20(coin0Addr, "decimals") as Promise<number>,
          ]),
          Promise.all([
            readErc20(coin1Addr, "symbol") as Promise<string>,
            readErc20(coin1Addr, "balanceOf", [lpAddress]) as Promise<bigint>,
            readErc20(coin1Addr, "decimals") as Promise<number>,
          ]),
        ])

        return {
          name: lpName,
          virtualPrice: formatStablePrice(virtualPrice),
          priceOracle: formatStablePrice(priceOracle),
          lastPrice: formatStablePrice(lastPrice),
          coin0: symbol0,
          balance0: Math.trunc(Number(formatUnits(balance0Raw, decimals0))),
          coin1: symbol1,
          balance1: Math.trunc(Number(formatUnits(balance1Raw, decimals1))),
        }
      })
    )
    setLpRows(results)
    setIsLoadingLps(false)
  }, [])

  useEffect(() => {
    fetchLpData()
  }, [fetchLpData])

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

  useEffect(() => {
    if (currentAddress !== zeroAddress) {
      fetchDebtIndexes()
    }
  }, [currentAddress])

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

  const [isMintingIR, setIsMintingIR] = useState(false)
  const handleMintIR = async () => {
    if (!walletClient || !IR_CALCULATOR_ADDRESS) {
      return
    }

    if (mintableInterests === null || mintableInterests === 0n) {
      return
    }

    setIsMintingIR(true)

    try {
      await executeContractCall(walletClient, {
        address: IR_CALCULATOR_ADDRESS,
        abi: IR_CALCULATOR_ABI,
        functionName: "mintIR",
        args: [], // mintIR() ne prend normalement pas d'arguments
      })

      // Rafraîchir les données après mint
      await fetchDebtIndexes()
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e)
      console.error("Mint IR failed:", errorMsg)
    } finally {
      setIsMintingIR(false)
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

      {/* Curve LP Pools */}
      <div className="flex flex-col gap-3 rounded-[10px] bg-overlay-panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Curve LP Pools</h2>
          <button
            onClick={fetchLpData}
            disabled={isLoadingLps}
            className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-50"
          >
            {isLoadingLps ? "Loading..." : "Refresh"}
          </button>
        </div>

        {isLoadingLps && lpRows.length === 0 && <p className="text-sm text-white/50">Loading pools...</p>}

        {lpRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
                  <th className="pb-2 pr-6 font-medium">Pool</th>
                  <th className="pb-2 pr-6 font-medium">Virtual Price</th>
                  <th className="pb-2 pr-6 font-medium">Price Oracle</th>
                  <th className="pb-2 pr-6 font-medium">Last Price</th>
                  <th className="pb-2 pr-6 font-medium">Coin 0</th>
                  <th className="pb-2 pr-6 font-medium">Balance 0</th>
                  <th className="pb-2 pr-6 font-medium">Coin 1</th>
                  <th className="pb-2 font-medium">Balance 1</th>
                </tr>
              </thead>
              <tbody>
                {lpRows.map((row) => (
                  <tr key={row.name} className="border-b border-white/5">
                    <td className="py-2 pr-6 font-medium text-white">{row.name}</td>
                    <td className="py-2 pr-6 font-mono text-white">{row.virtualPrice}</td>
                    <td className="py-2 pr-6 font-mono text-white">{row.priceOracle}</td>
                    <td className="py-2 pr-6 font-mono text-white">{row.lastPrice}</td>
                    <td className="py-2 pr-6 text-white/70">{row.coin0}</td>
                    <td className="py-2 pr-6 font-mono text-white">{row.balance0.toLocaleString()}</td>
                    <td className="py-2 pr-6 text-white/70">{row.coin1}</td>
                    <td className="py-2 font-mono text-white">{row.balance1.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-[10px] bg-overlay-panel p-5">
        {/* Valeur globale Mintable Interests */}
        {/* Valeur globale Mintable Interests + Bouton Mint */}
        {mintableInterests !== null && (
          <div className="flex items-center justify-between rounded-md bg-white/5 p-4">
            <div>
              <span className="text-white/70">Mintable Interests (global) : </span>
              <span className="font-mono text-lg text-white">{formatEther(mintableInterests)}</span>
              <span className="ml-2 text-xs text-white/40">({mintableInterests.toString()})</span>
            </div>

            <button
              onClick={handleMintIR}
              disabled={isMintingIR || mintableInterests === 0n || !walletClient}
              className="flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isMintingIR ? "Minting..." : "Mint Interests"}
            </button>
          </div>
        )}
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
                  <th className="pb-2 pr-6 font-medium">Debt Index (27 dec)</th>
                  <th className="pb-2 pr-6 font-medium">User Debt Shares</th>
                  <th className="pb-2 font-medium">Total Debt Shares</th>
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
                      <td className="py-2 pr-6 font-mono">
                        {row.error ? (
                          <span className="text-xs text-red-400">{row.error}</span>
                        ) : row.index !== null ? (
                          <div className="flex flex-col">
                            <span className="text-white">{Number(formatUnits(row.index, 27)).toFixed(5)}</span>
                            <span className="text-xs text-white/40">{row.index.toString()}</span>
                          </div>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-6 font-mono text-white">
                        {row.userDebtShares !== null ? (
                          Number(formatEther(row.userDebtShares)).toFixed(5)
                        ) : currentAddress ? (
                          <span className="text-white/30">—</span>
                        ) : (
                          <span className="text-xs text-white/40">Connect wallet</span>
                        )}
                      </td>
                      <td className="py-2 font-mono text-white">
                        {row.totalDebtShares !== null ? Number(formatEther(row.totalDebtShares)).toFixed(5) : <span className="text-white/30">—</span>}
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
