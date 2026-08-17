/**
 * Seeds the vsTAN reward stream on a local node and optionally fast-forwards the chain, so that
 * locked positions have claimable USG to test the claim screen against.
 *
 * What it does, in order :
 *   1. checks USG is registered as a reward token (setup_local_tan.js handles registering it)
 *   2. funds the vsTAN owner with USG — taken from a wallet that already holds some, since
 *      processRewards does safeTransferFrom(msg.sender) and the owner starts empty
 *   3. owner approves vsTAN and calls processRewards, which streams the amount linearly over
 *      exactly ONE WEEK (periodFinish = now + 1 week) — anything past that stops accruing
 *   4. advances the chain clock and mines, so the stream actually elapses
 *   5. prints claimableRewards for every position the test wallet owns
 *
 * Local dev chain only (chainId 31337). Nothing here is safe anywhere else.
 *
 *   npm run helper:seed-tan-rewards -- --amount=7000 --days=3 --from=0x...
 */
import { createPublicClient, createWalletClient, http, parseAbi, parseUnits, formatUnits } from "viem"
import { readFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const LOCAL_CHAIN_ID = 31337
const ENV_PATH = join(dirname(fileURLToPath(import.meta.url)), "../.env")

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const env = readFileSync(ENV_PATH, "utf8")
const readEnvVar = (key) => {
  const match = new RegExp(`^${key}\\s*=\\s*(.*)$`, "m").exec(env)
  return match ? match[1].trim().replace(/^['"]|['"]$/g, "") : undefined
}

const RPC = process.env.LOCAL_RPC || readEnvVar("NEXT_PUBLIC_CHAIN_RPC") || "http://127.0.0.1:8545"
const A = JSON.parse(readEnvVar("NEXT_PUBLIC_ADDRESSES_JSON"))

const AMOUNT = parseUnits(arg("amount", "7000"), 18)
const DAYS = Number(arg("days", "3"))
// Wallet the USG is taken from, and whose positions are reported. Defaults to the usual test account.
const FROM = arg("from", "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65")

const pub = createPublicClient({ transport: http(RPC) })

const vsTanAbi = parseAbi([
  "function owner() view returns (address)",
  "function balanceOf(address) view returns (uint256)",
  "function tokenOfOwnerByIndex(address,uint256) view returns (uint256)",
  "function getRewardData(address) view returns (uint128 lastUpdateTime, uint128 periodFinish, uint256 rewardRate, uint256 rewardPerTokenStored)",
  "function claimableRewards(uint256) view returns ((address token, uint256 amount)[])",
  "function processRewards((address token, uint256 amount)[])",
  "function totalSupplyVsTan() view returns (uint256)",
])
const erc20 = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
])

const impersonate = async (address) => {
  await pub.request({ method: "hardhat_impersonateAccount", params: [address] })
  await pub.request({ method: "hardhat_setBalance", params: [address, "0xDE0B6B3A7640000"] })
  return createWalletClient({ account: address, transport: http(RPC) })
}
const stop = (address) => pub.request({ method: "hardhat_stopImpersonatingAccount", params: [address] })
const send = async (client, req) => pub.waitForTransactionReceipt({ hash: await client.writeContract({ ...req, chain: null }) })

const main = async () => {
  const chainId = await pub.getChainId()
  if (chainId !== LOCAL_CHAIN_ID) {
    console.error(`refusing to run against chainId ${chainId} — local dev chain only`)
    process.exit(1)
  }

  const { vsTAN, USG } = A.tokens
  const owner = await pub.readContract({ address: vsTAN, abi: vsTanAbi, functionName: "owner" })

  const reward = await pub.readContract({ address: vsTAN, abi: vsTanAbi, functionName: "getRewardData", args: [USG] })
  if (reward[0] === 0n) {
    console.error("USG is not a registered reward token — run `npm run helper:setup-local-tan` first")
    process.exit(1)
  }

  const locked = await pub.readContract({ address: vsTAN, abi: vsTanAbi, functionName: "totalSupplyVsTan" })
  if (locked === 0n) {
    console.error("no TAN is locked — create a position first, otherwise the stream accrues to nobody")
    process.exit(1)
  }

  console.log(`streaming ${formatUnits(AMOUNT, 18)} USG over one week, against ${formatUnits(locked, 18)} vsTAN locked\n`)

  // 1. fund the owner : processRewards pulls from msg.sender
  const available = await pub.readContract({ address: USG, abi: erc20, functionName: "balanceOf", args: [FROM] })
  if (available < AMOUNT) {
    console.error(`${FROM} holds ${formatUnits(available, 18)} USG, need ${formatUnits(AMOUNT, 18)}`)
    process.exit(1)
  }

  const funder = await impersonate(FROM)
  await send(funder, { address: USG, abi: erc20, functionName: "transfer", args: [owner, AMOUNT] })
  await stop(FROM)
  console.log(`  funded owner ${owner} with ${formatUnits(AMOUNT, 18)} USG (from ${FROM})`)

  // 2. owner approves and notifies the stream
  const ownerClient = await impersonate(owner)
  await send(ownerClient, { address: USG, abi: erc20, functionName: "approve", args: [vsTAN, AMOUNT] })
  await send(ownerClient, { address: vsTAN, abi: vsTanAbi, functionName: "processRewards", args: [[{ token: USG, amount: AMOUNT }]] })
  await stop(owner)

  const after = await pub.readContract({ address: vsTAN, abi: vsTanAbi, functionName: "getRewardData", args: [USG] })
  console.log(`  processRewards OK — rewardRate ${after[2]} wei/s, periodFinish ${after[1]}`)

  // 3. let the stream elapse
  if (DAYS > 0) {
    await pub.request({ method: "evm_increaseTime", params: [Math.floor(DAYS * 86400)] })
    await pub.request({ method: "evm_mine", params: [] })
    const blk = await pub.getBlock()
    console.log(`  advanced ${DAYS} day(s) -> chain time ${new Date(Number(blk.timestamp) * 1000).toISOString()}`)
  }

  // 4. report
  const count = await pub.readContract({ address: vsTAN, abi: vsTanAbi, functionName: "balanceOf", args: [FROM] })
  console.log(`\nclaimable for ${FROM} (${count} position(s)):`)
  for (let i = 0n; i < count; i++) {
    const tokenId = await pub.readContract({ address: vsTAN, abi: vsTanAbi, functionName: "tokenOfOwnerByIndex", args: [FROM, i] })
    const rewards = await pub.readContract({ address: vsTAN, abi: vsTanAbi, functionName: "claimableRewards", args: [tokenId] })
    const line = rewards.map((r) => `${formatUnits(r.amount, 18)} (${r.token.slice(0, 10)}…)`).join(", ")
    console.log(`   #${tokenId}  ${line || "nothing"}`)
  }
  console.log("\nreload /tan/claim")
}

main().catch((err) => {
  console.error("\nseeding failed:", err.shortMessage || err.message)
  process.exit(1)
})
