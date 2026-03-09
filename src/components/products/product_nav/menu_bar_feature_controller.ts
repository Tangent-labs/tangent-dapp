export const isOnMarket = (path: string) => {
  return (
    path === "/" ||
    path.includes("deposit") ||
    path.includes("withdraw") ||
    path.includes("leverage") ||
    path.includes("liquidate") ||
    path.includes("repay") ||
    path.includes("borrow")
  )
}
