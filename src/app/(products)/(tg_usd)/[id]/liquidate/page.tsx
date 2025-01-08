import React from "react"

type TgUsdMarketLiquidatePageProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default async function TgUsdMarketLiquidatePage({ ...props }: TgUsdMarketLiquidatePageProps) {
  // Fetch data here if needed
  return (
    <div {...props}>
      <h1>TgUsdMarketLiquidatePage</h1>
      <p>This is a server-side component.</p>
    </div>
  )
}
