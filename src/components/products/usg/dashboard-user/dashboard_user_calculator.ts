import type { BorrowPosition, VAPRPoint, VAPRSimulation } from "./dashboard_user_type"

// vAPR calculator of a position: simulation of the vAPR against the price of USG, and the simulation saved by the user.
// Pure logic, no UI.

// Price range displayed by the calculator (same axis as the design)
export const CALCULATOR_MIN_PRICE = 0.98875
export const CALCULATOR_MAX_PRICE = 1
const CALCULATOR_POINTS = 80

export type CalculatorMode = "existing" | "custom"

export type CalculatorInputs = {
  mode: CalculatorMode
  isLeveraged: boolean
  // Collateral value when not leveraged
  collateralUsd: number
  debtUsd: number
  // Leveraged: collateral deposited first, and total collateral once the debt has been converted to collateral
  initialCollateralUsd: number
  totalCollateralUsd: number
  // Amount of debt used to farm elsewhere and the vAPR earned on it (in %)
  debtFarming: number
  debtVAPR: number
}

export const getDefaultInputs = (position: BorrowPosition): CalculatorInputs => ({
  mode: "existing",
  isLeveraged: false,
  collateralUsd: position.depositedUsd,
  debtUsd: position.debt,
  initialCollateralUsd: 0,
  totalCollateralUsd: 0,
  debtFarming: 0,
  debtVAPR: 0,
})

export const getInputsFromSimulation = (position: BorrowPosition, simulation: VAPRSimulation): CalculatorInputs => ({
  ...getDefaultInputs(position),
  isLeveraged: simulation.isLeveraged,
  collateralUsd: simulation.simulatedCollatAmount || position.depositedUsd,
  initialCollateralUsd: simulation.initialCollatAmount || 0,
  totalCollateralUsd: simulation.totalCollatAmount || 0,
  debtFarming: simulation.debtFarming || 0,
  debtVAPR: simulation.debtVAPR || 0,
})

export const getSimulationFromInputs = (inputs: CalculatorInputs): VAPRSimulation => ({
  isLeveraged: inputs.isLeveraged,
  debtFarming: inputs.debtFarming,
  debtVAPR: inputs.debtVAPR,
  ...(inputs.isLeveraged
    ? { initialCollatAmount: inputs.initialCollateralUsd, totalCollatAmount: inputs.totalCollateralUsd }
    : { simulatedCollatAmount: inputs.collateralUsd }),
})

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

// Rate applied on the collateral vAPR and rate paid on the debt at a given USG price (see docs: HEC / LEC / FIR markets)
const getMarketRatesAtPrice = (position: BorrowPosition, price: number) => {
  const { marketKind, pricing, apr, borrowRate } = position

  if (marketKind === "HEC") {
    // Rewards cut goes from 0% (USG at 1) to 100% (USG at the price threshold), then interest starts
    const rewardsCut = clamp01((1 - price) / (1 - pricing.priceThreshold))
    const debtRate =
      price < pricing.priceThreshold ? pricing.maxRate * clamp01((pricing.priceThreshold - price) / (pricing.priceThreshold - pricing.minPrice)) : 0
    return { collateralAPR: apr.current * (1 - rewardsCut), debtRate }
  }

  if (marketKind === "LEC") {
    // 2.5% protocol fee on rewards, interest goes up as USG goes down
    const debtRate = pricing.minRate + (pricing.maxRate - pricing.minRate) * clamp01((1 - price) / (1 - pricing.minPrice))
    return { collateralAPR: apr.current * 0.975, debtRate }
  }

  // FIR: 10% protocol fee on rewards, fixed interest rate
  return { collateralAPR: apr.current * 0.9, debtRate: borrowRate }
}

const getPositionAmounts = (inputs: CalculatorInputs) => {
  const collateralUsd = inputs.isLeveraged ? inputs.totalCollateralUsd : inputs.collateralUsd
  const debtUsd = inputs.isLeveraged ? inputs.totalCollateralUsd - inputs.initialCollateralUsd + inputs.debtFarming : inputs.debtUsd
  // Capital the user actually put in, base of the yield
  const accountedCollateralUsd = inputs.isLeveraged ? inputs.initialCollateralUsd : inputs.collateralUsd

  return { collateralUsd, debtUsd, accountedCollateralUsd }
}

const computeVAPRAtPrice = (position: BorrowPosition, inputs: CalculatorInputs, price: number) => {
  const { collateralUsd, debtUsd, accountedCollateralUsd } = getPositionAmounts(inputs)
  if (accountedCollateralUsd <= 0) return 0

  const { collateralAPR, debtRate } = getMarketRatesAtPrice(position, price)
  const farmingGain = inputs.debtFarming * inputs.debtVAPR

  const vAPR = (collateralUsd * collateralAPR - debtUsd * debtRate + farmingGain) / accountedCollateralUsd
  return Number.isFinite(vAPR) ? vAPR : 0
}

export const simulateVAPRCurve = (position: BorrowPosition, inputs: CalculatorInputs): VAPRPoint[] => {
  const range = CALCULATOR_MAX_PRICE - CALCULATOR_MIN_PRICE

  return Array.from({ length: CALCULATOR_POINTS }, (_, i) => {
    const price = CALCULATOR_MIN_PRICE + (i * range) / (CALCULATOR_POINTS - 1)
    return { price: Number(price.toFixed(4)), vAPR: computeVAPRAtPrice(position, inputs, price) }
  })
}

export const computePositionMetrics = (position: BorrowPosition, inputs: CalculatorInputs, usgPrice: number) => {
  const { collateralUsd, debtUsd, accountedCollateralUsd } = getPositionAmounts(inputs)
  const netVAPR = computeVAPRAtPrice(position, inputs, usgPrice)

  return {
    netVAPR,
    yearlyGains: accountedCollateralUsd * (netVAPR / 100),
    ltv: collateralUsd > 0 ? (debtUsd / collateralUsd) * 100 : null,
    health: debtUsd > 0 ? (collateralUsd * position.liquidationThreshold) / debtUsd : null,
  }
}

// ---------------------------
// SAVED SIMULATION
// Shared with the market page calculator: same key, same shape
// ---------------------------
const getSimulationKey = (marketAddress: string) => `vapr-calculator:${marketAddress.toLowerCase()}`

export const loadSimulation = (marketAddress: string): VAPRSimulation | null => {
  try {
    const stored = localStorage.getItem(getSimulationKey(marketAddress))
    return stored ? (JSON.parse(stored) as VAPRSimulation) : null
  } catch {
    return null
  }
}

export const saveSimulation = (marketAddress: string, simulation: VAPRSimulation) => {
  try {
    localStorage.setItem(getSimulationKey(marketAddress), JSON.stringify(simulation))
    return true
  } catch (err) {
    console.error("Failed to save vAPR simulation : ", err)
    return false
  }
}
