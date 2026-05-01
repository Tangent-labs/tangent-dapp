const RISK_COLORS = {
  safe: "#2e8b57",
  caution: "#b8860b",
  warning: "#ff8c00",
  danger: "#ff0000",
}

const VOLATILE_COLLATERAL_KEYWORDS = ["ETH", "BTC"]

export function isVolatileCollateral(symbol: string): boolean {
  return VOLATILE_COLLATERAL_KEYWORDS.some((keyword) => symbol.toUpperCase().includes(keyword))
}

// Thresholds are ratios of ltv/maxLtv. Volatile collaterals use stricter bands
export function getLTVColor(ltv: string | number, maxLtv: number, volatile = false): string | undefined {
  const ltvValue = typeof ltv === "number" ? ltv : parseFloat(String(ltv).replace("%", ""))
  if (isNaN(ltvValue) || ltvValue <= 0 || maxLtv <= 0) return undefined
  const ltvRatio = ltvValue / maxLtv
  if (volatile) {
    if (ltvRatio < 0.4) return RISK_COLORS.safe
    if (ltvRatio < 0.55) return RISK_COLORS.caution
    if (ltvRatio < 0.7) return RISK_COLORS.warning
    return RISK_COLORS.danger
  }
  if (ltvRatio < 0.7) return RISK_COLORS.safe
  if (ltvRatio < 0.8) return RISK_COLORS.caution
  if (ltvRatio < 0.92) return RISK_COLORS.warning
  return RISK_COLORS.danger
}
