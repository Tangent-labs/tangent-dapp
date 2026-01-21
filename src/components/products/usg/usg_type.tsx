import { Address } from "viem"
import { AprEntry, AssetData, AssetDataPriced, CollateralInfo, ERC20StaticInfos, ExistingAsset, Network, TokenAmountPriced } from "@/types"

export type MarketPlatforms = "convex" | "curve"

export type USGMarketData = {
  network: Network
  platforms: MarketPlatforms[]
  collateral: ExistingAsset
  apr: AprEntry
  borrowRate: number
  tvl: number
  borrowed: number
  cap: number
  marketAddress: Address
}

export type USGTokenAmount = {
  token: string
  symbol: ExistingAsset
  amount: bigint
}

export type HarvesterInfo = {
  collateralName: string
  harvesterFeePercentage: bigint
  marketAddress: string
  tokenAmounts: USGTokenAmount[]
  lastHarvestDate: bigint
}

export type USGMarketDataUser = {
  debt: number
  health: number
}

export type USGGlobalData = {
  USGPrice: string
  USGSupply: string
  sUSGPrice: string
  sUSGSupply: string
  globalCr: string
  globalDebt: string
  globalTvl: string
}

export type USGMarketType = "Convex_CRV" | "Convex_FXN" | "Pendle_PT" | "STAKEDAO_CRV_Vault"

export type ClaimerInfoDisplay = {
  asset: ExistingAsset // Address
  stakingAddress: Address
  rewards: TokenAmountPriced
  isProcessed: boolean
  percentage: number
  harvesterFees: number
}

export type CollatStaked = {
  amount: bigint
  decimals: bigint
  symbol: ExistingAsset
  token: Address
}

export type ClaimerInfo = {
  marketAddress: Address
  collatStakedUsdValue: bigint
  collatStaked: CollatStaked
  claimableTokens: CollatStaked[]
}

export type ClaimAsset = {
  amount: string
  valueInUsd: string
  symbol: ExistingAsset
}

export type ClaimData = {
  marketAddress: Address
  marketName: string
  claimable: ClaimAsset[]
  totalClaimableValue: string
  deposited: ClaimAsset
  totalDepositedValue: string
}

export type ClaimableMarket = {
  marketName: ExistingAsset
  marketAddress: Address
  claimable: string
}

export type HarvestableMarket = {
  marketName: ExistingAsset
  marketAddress: Address
  harvestable: number
}

export interface ChainViewMarketRow {
  marketAddress: string
  collateralInfos: CollateralInfos
  debtInfos: DebtInfos
  constants: MarketConstants
  obas: OutputBalanceAllowances[]
  rewardTokens: ERC20StaticInfos[]
  sociabilization: SociabilizationData
  marketType?: USGMarketType
}

export interface CollateralInfos {
  collateralToken: ERC20StaticInfos
  totalCollateralUSDValue: bigint
  totalCollateralAmount: bigint
  collateralUSDPrice: bigint
  positionCollateralAmount: bigint
  positionCollateralUSDValue: bigint
  priceOracle: string
}

export interface DebtInfos {
  totalDebt: bigint
  positionDebt: bigint
  userDebt: bigint
  healthRatio: string
  currentBorrowRate: bigint
  futureBorrowRate: bigint
  currentRewardCut: string
  futureRewardCut: string
}

export interface MarketConstants {
  maxLTV: bigint
  maxMarketDebt: bigint
  minimumLoan: bigint
  liquidationThreshold: bigint
  irParams: {
    a1: number
    a2: number
    k: number
    isHEC: boolean
    rMin: number
    rMax: number
    pMin: number
    pMax: number
    pInf: number
  }
  rcParams: {
    endCutPercentage: bigint
    endCutPrice: bigint
    harvestFeePercentage: bigint
    startCutPercentage: bigint
    startCutPrice: bigint
    stepAmount: number
  }
  receipt: Address
}

export interface OutputBalanceAllowances {
  token: string // Address of the token
  balance: string
  allowances: Allowance[]
}

export interface Allowance {
  spender: string // Address of the spender
  allowance: string
}

export type ChainViewMarketList = {
  USGPrice: bigint // uint256
  USGSupply: bigint // uint256
  sUSGPrice: bigint // uint256
  sUSGSupply: bigint // uint256
  USGPercentageInSUSG: bigint // uint256
  rowInfos: ChainViewMarketRow[]
}

export type SociabilizationData = {
  socFeePending: bigint
  socFeePercentage: bigint
}

export type MarketDetailData = {
  marketAddress: Address
  collateralInfo: CollateralInfo
  debtInfos: DebtInfos
  constants: MarketConstants
  collateralBalance: bigint
  collateralAllowance: bigint
  collateralInfos: CollateralInfos
  marketType?: USGMarketType
  sociabilization?: SociabilizationData
}

export type USGMarketDepositParams = USGMarketBorrowParams & {
  depositWeiValue: bigint
  isReceiptIn: boolean
  isDepositAndBorrow?: boolean
}

export type USGMarketBorrowParams = {
  borrowWeiValue?: bigint
  marketAddress: Address
}

export type USGMarketWitrhdrawParams = {
  withdrawWeiValue?: bigint
  marketAddress: Address
  isReceiptOut: boolean
}

export type USGMarketRepayParams = {
  marketAddress: Address
  repayWeiValue?: bigint
  withdrawWeiValue?: bigint
  isReceiptOut?: boolean
}

export type USGMarketLoanDisplayData = {
  collateralValue: string
  debt: string
  health: string
  ltv: string
  maxBorrowable: string
  maxWithdrawable: string
}

export type USGMarketDisplayData = USGMarketLoanDisplayData & {
  tvl: string
  tvlDollar: string
  borrowed: string
  borrowRateCurrent: number
  borrowRateNext: number
  cap: string
  maxLtv: string
  maxLtvDollar: string
  rewardsCutCurrent: string
  rewardsCutNext: string
  lt: string
  ltDollar: string
}

export type USGMarketAmounts = {
  depositWeiValue?: bigint
  borrowWeiValue?: bigint
  withdrawWeiValue?: bigint
  repayWeiValue?: bigint
  zapValue?: bigint
  liquidateValue?: bigint
}

export type HarvesterInfoDisplay = {
  asset: ExistingAsset
  contractAddress: Address
  rewards: TokenAmountPriced
  isProcessed: boolean
  percentage: number
  harvesterFees: number
  lastHarvestDate: string
}

export type SwapToken = AssetData & {
  chainId?: number
  logoURI: string
}

export type ZapToken = AssetData & {
  chainId?: number
  logoURI: string
  price: number
}

export type BalanceAllowanceData = {
  token: Address
  balance: bigint
  allowances: Array<{ spender: Address; allowance: bigint }>
}

export type ZapMarketData = {
  tokenIn: Address
  amountIn: bigint
  minAmountOut: bigint
}

export type USGMarket = {
  marketAddress: Address
  marketName: ExistingAsset
  collatAddress: Address
  marketType: "Convex_CRV" | "Convex_FXN" | "Pendle_PT" | "STAKEDAO_CRV_Vault"
}

export type USGStakingInfo = {
  USGAllowance: bigint
  USGBalance: bigint
  USGPercentageInsUSG: bigint
  USGPrice: bigint
  USGSupply: bigint
  sUSGBalance: bigint
  sUSGPrice: bigint
  sUSGSupply: bigint
}

export type StakingDepositType = "asset" | "sdAsset"

export type StakingAssetInfo = {
  balance: bigint | undefined
  address: Address
  current: StakingDepositType
  asset?: AssetDataPriced
}

export type DepositReceiveAsset = {
  logoURI?: string
  logo?: ExistingAsset
  value: string
  name?: string
  symbol: string
  balance?: bigint
}

export type EarnProtocolInput = {
  name: string
  asset: string
  link: string
  protocolName: string
  actionLabel: string
  points: number
  address: string
}

export type EarnTask = {
  name: string
  asset: string
  link: string
  protocolName: string
  actionLabel: string
  currentAPR: number
  projectedAPR: number
  points: number
  address: string
}

export type LockPosition = {
  amount: bigint
  claimable: bigint
  endLockTime: string
  tokenId: bigint
}

export type LockData = {
  allowance: bigint
  balance: bigint
  percentageLocked: bigint
  positions: LockPosition[]
  tanAPR: bigint
  tanPrice: bigint
  totalLocked: bigint
  totalSupply: bigint
}

export type LockPositionSelectTemplate = {
  amount?: bigint
  claimable?: bigint
  endLockTime?: string
  tokenId?: bigint
  label?: string
  value?: string
}

export type PendleSYToPTQuote = {
  market: string | undefined
  pt: string | undefined
  sy: string | undefined
  underlyingIn: string
  tokenInAmount: bigint
}

export type PendlePTToSYQuote = {
  market: string | undefined
  pt: string | undefined
  sy: string | undefined
  underlyingOut: string
  ptAmount: bigint
}

export type CurveQuote = {
  _route: Address[]
  _swap_params: bigint[][]
  _amount: bigint
  _pools: Address[]
}

export type UserPosition = {
  label: string
  collatAmount: bigint
  usgAmount: bigint
  date: Date
  txHash: string
}

export type MarketDebtData = {
  id: number
  value: number
  name: string
  rawValue: bigint
}

export type USGCollateralData = {
  name: string
  value: number
}

export interface IrParams {
  a1: number
  a2: number
  isHEC: boolean
  k: number
  pInf: number
  pMax: number
  pMin: number
  rMax: number
  rMin: number
}

export type MarketHistoricalData = {
  timestamp: string
  tvl_usd: number
  total_debt: number
  ir_apy: number
  apr_current: string
}

export type TotalBorrow = {
  latestTotalDebt: string
  data: Array<{
    timestamp: string
    value: string
  }>
}

export type UserTask = {
  taskId: number
  asset: string
  protocol: string
  url: string
  description: string
  pointRate: number
  status: boolean
  points: number
  tokenAddress: Address
  priceUSD: number
  balance?: number
  balanceUsd?: number
}

export type VoteTask = {
  taskId: number
  organisation: string
  protocol: string
  url: string
  description: string
  pointRate: number
  points: number
  lastVotingPower: number
}

export type LpUserPoints = {
  lpTotalPoints: number
  lpDailyRate: number
}

export type RefereesPoints = {
  lpPoints: number
  votePoints: number
}

export type VoteUserPoints = {
  voteTotalPoints: number
}

export type Leaderboard = Array<{
  rank: number
  address: Address
  pts: number
}>

export type GodsonLeaderboard = Array<{
  rank: number
  address: Address
  lpPoints: number
  votePts: number
}>

export type Boost = {
  type: string
  description: string
  boost: number
  status: boolean
}

export type MarketAPR = {
  currentAPR: {
    [rewardToken: string]: number // allows any other dynamic APR components (e.g. CRV, CVX, FXN, etc.)
  }
  projectedAPR: {
    [rewardToken: string]: number // allows any other dynamic APR components (e.g. CRV, CVX, FXN, etc.)
  }
  marketAddress: Address
  marketName: string
}

export type MarketListAPRData = {
  marketAddress: Address
  collateral: ExistingAsset
  currentAPR: {
    [rewardToken: string]: number // allows any other dynamic APR components (e.g. CRV, CVX, FXN, etc.)
  }
  projectedAPR: {
    [rewardToken: string]: number // allows any other dynamic APR components (e.g. CRV, CVX, FXN, etc.)
  }
}

export type GaugeAPR = {
  protocol: string
  address: Address
  gaugeCrvApy: Array<number>
  gaugeFutureCrvApy: Array<number>
  lpTokenAddress?: Address
  convexPoolData?: { usdTotal?: number }
  usdTotal?: number
}

export type StakeDaoAPRData = {
  lpToken: {
    address: string
  }
  apr: {
    current: {
      total: number
    }
    projected: { total: number }
  }
}

export type SavingAccountsApy = {
  timestamp: Date
  value: number
  key: string
  tokenAddress: string
}

export type TVLData = {
  timestamp: number
  markets: number
  wts: number
  pegKeepers: number
  susg: number
}
