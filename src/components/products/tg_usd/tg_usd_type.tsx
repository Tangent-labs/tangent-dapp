import {
  AprEntry,
  AssetData,
  AssetDataPriced,
  CollateralInfo,
  ERC20StaticInfos,
  ExistingAsset,
  Network,
  PositionData,
  TokenAmountPriced,
  TokenAmountPricedRow,
} from "@/types"
import { Address } from "viem"

export type TgUsdGlobalMarketData = {
  tgUsdPrice: number
  tgUsdsupply: number
  sgUsdprice: number
  sgUsdsupply: number
  globalCr: number
  GlobalTvl: number
}

export type TgUsdCampaignData = {
  debts: number
  deposists: number
  totalPoints: number
}

export type MarketPlatforms = "convex" | "curve"

export type TgUsdMarketData = {
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

export type TgUSDTokenAmount = {
  token: string
  symbol: ExistingAsset
  amount: bigint
}

export type HarvesterInfo = {
  collateralName: string
  harvesterFeePercentage: bigint
  marketAddress: string
  tokenAmounts: TgUSDTokenAmount[]
  lastHarvestDate: bigint
}

export type TgUsdMarketDataUser = {
  debt: number
  health: number
}

export type TgUsdAirdropData = {
  debts: number
  deposists: number
  totalPoints: number
}

export type TgUsdGlobalData = {
  tgUsdPrice: string
  tgUsdSupply: string
  sgUsdPrice: string
  sgUsdSupply: string
  APY: string
  globalCr: string
  globalDebt: string
  globalTvl: string
}

export type TgUsdMarketType = "Convex_CRV" | "Convex_FXN"

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
  marketName: ExistingAsset
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

export interface ChainViewMarketRow {
  marketAddress: string
  collateralInfos: CollateralInfos
  debtInfos: DebtInfos
  constants: MarketConstants
  obas: OutputBalanceAllowances[]
  rewardTokens: ERC20StaticInfos[]
  sociabilization: SociabilizationData
  marketType?: TgUsdMarketType
}

export interface CollateralInfos {
  collateralToken: ERC20StaticInfos
  totalCollateralUSDValue: bigint
  totalCollateralAmount: string
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
  futureBorrowRate: string
  currentRewardCut: string
  futureRewardCut: string
}

export interface MarketConstants {
  maxLTV: bigint
  maxMarketDebt: string
  minimumLoan: bigint
  liquidationThreshold: string
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
  tgUSDPrice: bigint // uint256
  tgUSDSupply: bigint // uint256
  sgUSDPrice: bigint // uint256
  sgUSDSupply: bigint // uint256
  tgUSDPercentageInSgUSD: bigint // uint256
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
  marketType?: TgUsdMarketType
  sociabilization?: SociabilizationData
}

export type TgUsdtMarketDepositParams = TgUsdtMarketBorrowParams & {
  isStaking: boolean
  isDepositAndBorrow: boolean
  depositWeiValue: bigint
}

export type TgUsdtMarketBorrowParams = {
  borrowWeiValue?: bigint
  marketAddress: Address
}

export type TgUsdtMarketWitrhdrawParams = {
  withdrawWeiValue?: bigint
  marketAddress: Address
}

export type TgUsdtMarketLiquidateParams = {
  liquidateWeiValue?: bigint
  marketAddress: Address
}

export type TgUsdtMarketRepayParams = {
  marketAddress: Address
  repayWeiValue?: bigint
  withdrawWeiValue?: bigint
}

export type TgUsdMarketLoanDisplayData = {
  collateralValue: string
  debt: string
  health: string
  ltv: string
  maxBorrowable: string
  maxWithdrawable: string
}

export type TgUsdMarketDisplayData = TgUsdMarketLoanDisplayData & {
  tvl: string
  tvlDollar: string
  borrowed: string
  borrowRateCurrent: string
  borrowRateNext: string
  cap: string
  maxLtv: string
  maxLtvDollar: string
  rewardsCutCurrent: string
  rewardsCutNext: string
  lt: string
  ltDollar: string
}

export type TgUsdMarketAmounts = {
  depositWeiValue?: bigint
  borrowWeiValue?: bigint
  withdrawWeiValue?: bigint
  repayWeiValue?: bigint
  zapValue?: bigint
  liquidateValue?: bigint
}

export type HarvesterInfoDisplay = {
  asset: ExistingAsset // Address
  contractAddress: Address
  rewards: TokenAmountPriced
  isProcessed: boolean
  percentage: number
  harvesterFees: number
  lastHarvestDate: bigint
}

export type BoosterClaimListRow = {
  token: ExistingAsset
  stakingAddress: Address
  name: string
  apr: {
    current: number
    projected: number
  }
  claimableDetail: TokenAmountPricedRow[]
  claimable: { key: string; label: string; value: string; raw?: number }
  positionsDetails: PositionData[]
}

export type ClaimSdtStakingContract = {
  stakingContract: string
  tokenIds: number[]
}

export interface ClaimMultipleStakingArgs {
  claimContracts: ClaimSdtStakingContract[]
  minCvgSdtAmountOut: bigint
  isConvert: boolean
  sdtRewardCount: number
}

export type ZapperData = {
  amountOut: bigint
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

export type TgUsdMarket = {
  marketAddress: Address
  marketName: ExistingAsset
  collatAddress: Address
  marketType: "Convex_CRV" | "Convex_FXN"
}

export type StakingInfo = {
  sgUSDBalance: bigint
  sgUSDPrice: bigint
  sgUSDSupply: bigint
  tgUSDAllowance: bigint
  tgUSDBalance: bigint
  tgUSDPercentageInSgUSD: bigint
  tgUSDPrice: bigint
  tgUSDSupply: bigint
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

export type AirdropTask = {
  name: string
  asset: string
  link: string
  protocolName: string
  actionLabel: string
  ptsPerDay: number
  status: string
  totalPoints: number
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
