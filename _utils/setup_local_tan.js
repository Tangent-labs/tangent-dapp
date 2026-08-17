/**
 * Re-applies the local-node prerequisites the TAN / vsTAN pages need.
 *
 * Both of them are chain state or env config that the local deployment doesn't currently produce,
 * and the chain half is wiped every time the node restarts :
 *
 *   1. lps["TAN-WETH"] must exist in NEXT_PUBLIC_ADDRESSES_JSON. VsTANInfo.getVsTanInfo() treats the
 *      zero address as "no pool" and simply prices TAN at 0, but a missing key makes the address
 *      `undefined`, which throws while encoding the LockUI call before any RPC even happens.
 *
 *   2. vsTAN needs at least one reward token registered. LockUI reads
 *      `vsTan.claimableRewards(tokenId)[0].amount`, and claimableRewards sizes its array from
 *      rewardTokens.length. With no reward token that array is empty, so `[0]` reverts with
 *      Panic 0x32 as soon as the connected wallet owns a single position — which surfaces in the UI
 *      as lockData === 50n (the panic code, 0x32, leaking through executeChainView).
 *
 * Safe to re-run : it checks before writing anything, and it only ever touches a local dev chain
 * (chainId 31337). Runs automatically through `predev`, so a node restart needs nothing manual. It
 * never fails the build : an unreachable node or any other chain just prints a notice and exits 0.
 *
 *   npm run helper:setup-local-tan      (to run it on its own)
 */
const fs = require("fs")
const path = require("path")

const LOCAL_CHAIN_ID = 31337

const ENV_PATH = path.join(__dirname, "../.env")

const readEnvVar = (env, key) => {
  const match = new RegExp(`^${key}\\s*=\\s*(.*)$`, "m").exec(env)
  return match ? match[1].trim().replace(/^['"]|['"]$/g, "") : undefined
}

// Target whatever the app targets, so this can't act on a chain the dapp isn't even pointed at
const RPC = process.env.LOCAL_RPC || readEnvVar(fs.readFileSync(ENV_PATH, "utf8"), "NEXT_PUBLIC_CHAIN_RPC") || "http://127.0.0.1:8545"

const rpc = async (method, params = []) => {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  })
  const json = await res.json()
  if (json.error) throw new Error(`${method}: ${json.error.message}`)
  return json.result
}

const call = (to, data) => rpc("eth_call", [{ to, data }, "latest"])

const pad = (hexOrAddress) => hexOrAddress.replace(/^0x/, "").toLowerCase().padStart(64, "0")

// keccak selectors of the few functions this script touches
const SEL = {
  owner: "0x8da5cb5b",
  getRewardData: "0x451831e4",
  addNewReward: "0xc7dd1cc6",
}

const readAddresses = () => {
  const env = fs.readFileSync(ENV_PATH, "utf8")
  const match = /^(NEXT_PUBLIC_ADDRESSES_JSON\s*=\s*)(.*)$/m.exec(env)
  if (!match) throw new Error("NEXT_PUBLIC_ADDRESSES_JSON not found in .env")

  let raw = match[2].trim()
  let quote = ""
  if (raw && (raw[0] === '"' || raw[0] === "'") && raw[raw.length - 1] === raw[0]) {
    quote = raw[0]
    raw = raw.slice(1, -1)
  }
  return { env, match, quote, addresses: JSON.parse(raw) }
}

const ZERO = "0x0000000000000000000000000000000000000000"

// The deployment writes its addresses here. Optional : a missing file just means no cross-check.
const REFERENCE_PATH = path.join(__dirname, "../../tangent-indexer/addresses.json")

const readReferenceAddresses = () => {
  try {
    return JSON.parse(fs.readFileSync(REFERENCE_PATH, "utf8"))
  } catch {
    return null
  }
}

const writeAddresses = (env, match, quote, addresses) => {
  const line = match[1] + quote + JSON.stringify(addresses) + quote
  fs.writeFileSync(ENV_PATH, env.slice(0, match.index) + line + env.slice(match.index + match[0].length))
}

const ensureTanLp = (reference) => {
  const { env, match, quote, addresses } = readAddresses()

  const current = addresses.lps?.["TAN-WETH"]
  const deployed = reference?.lps?.["TAN-WETH"]

  // A real pool always wins, including over a zero address left behind by a previous run
  if (deployed && deployed !== ZERO) {
    if (current === deployed) {
      console.log(`  lps["TAN-WETH"]      real pool already set (${deployed})`)
      return addresses
    }

    addresses.lps = addresses.lps || {}
    addresses.lps["TAN-WETH"] = deployed
    writeAddresses(env, match, quote, addresses)

    console.log(`  lps["TAN-WETH"]      real pool picked up from the deployment (${deployed})`)
    if (current === ZERO) console.log("                       -> replaced the zero-address placeholder, TAN now prices for real")
    console.log("                       -> restart `next dev`, NEXT_PUBLIC_* is inlined at build time")
    return addresses
  }

  if (current) {
    console.log(`  lps["TAN-WETH"]      ${current === ZERO ? "zero-address placeholder (TAN price reads 0)" : `set (${current})`}`)
    return addresses
  }

  addresses.lps = addresses.lps || {}
  addresses.lps["TAN-WETH"] = ZERO
  writeAddresses(env, match, quote, addresses)

  console.log('  lps["TAN-WETH"]      no pool deployed, ADDED the zero address (TAN price will read 0)')
  console.log("                       -> restart `next dev`, NEXT_PUBLIC_* is inlined at build time")
  return addresses
}

// A redeploy changes every address : catch a stale .env before it turns into hours of confusion
const warnOnAddressDrift = (reference) => {
  if (!reference?.tokens) return

  const { addresses } = readAddresses()

  const drifted = Object.entries(reference.tokens).filter(([name, addr]) => {
    const mine = addresses.tokens?.[name]
    return mine && mine.toLowerCase() !== String(addr).toLowerCase()
  })

  if (!drifted.length) return

  console.warn("\n  !! .env addresses differ from the deployment output:")
  for (const [name, addr] of drifted) {
    console.warn(`     ${name.padEnd(6)} .env ${addresses.tokens[name]}  vs  deployed ${addr}`)
  }
  console.warn("     -> copy the fresh addresses.json into NEXT_PUBLIC_ADDRESSES_JSON")
}

const ensureRewardToken = async (vsTan, usg) => {
  const rewardData = await call(vsTan, SEL.getRewardData + pad(usg))
  // Reward struct starts with lastUpdateTime : non-zero means the token is already registered
  const lastUpdateTime = BigInt("0x" + rewardData.slice(2, 66))

  if (lastUpdateTime !== 0n) {
    console.log("  vsTAN reward token   already registered")
    return
  }

  const owner = "0x" + (await call(vsTan, SEL.owner)).slice(-40)
  console.log(`  vsTAN reward token   MISSING -> registering USG as owner ${owner}`)

  await rpc("hardhat_impersonateAccount", [owner])
  await rpc("hardhat_setBalance", [owner, "0xDE0B6B3A7640000"])

  const hash = await rpc("eth_sendTransaction", [{ from: owner, to: vsTan, data: SEL.addNewReward + pad(usg) }])
  const receipt = await rpc("eth_getTransactionReceipt", [hash])

  await rpc("hardhat_stopImpersonatingAccount", [owner])

  if (!receipt || receipt.status !== "0x1") throw new Error("addNewReward(USG) failed")
  console.log("                       -> addNewReward(USG) OK")
}

const main = async () => {
  let chainId
  try {
    chainId = parseInt(await rpc("eth_chainId"), 16)
  } catch {
    // No node listening : nothing to set up, and never a reason to stop `next dev`
    console.log(`[tan setup] no node reachable on ${RPC}, skipping`)
    return
  }

  if (chainId !== LOCAL_CHAIN_ID) {
    console.log(`[tan setup] chainId ${chainId} is not the local dev chain, skipping`)
    return
  }

  console.log(`[tan setup] local node ${RPC} (chainId ${chainId})`)

  const reference = readReferenceAddresses()

  const addresses = ensureTanLp(reference)
  await ensureRewardToken(addresses.tokens.vsTAN, addresses.tokens.USG)

  warnOnAddressDrift(reference)
}

main().catch((err) => {
  // Best effort : report loudly, but let the dev server start regardless
  console.warn(`[tan setup] skipped — ${err.message}`)
})
