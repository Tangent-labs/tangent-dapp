import React from "react"

type TgUsdMarketWithdrawPageProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default async function TgUsdMarketWithdrawPage({ ...props }: TgUsdMarketWithdrawPageProps) {
  // Fetch data here if needed
  return (
    <div {...props}>
      <h1>TgUsdMarketWithdrawPage</h1>
      <p>This is a server-side component.</p>
    </div>
  )
}
