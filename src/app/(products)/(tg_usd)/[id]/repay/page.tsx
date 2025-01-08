import React from "react"

type TgUsdMarketRepayPageProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default async function TgUsdMarketRepayPage({ ...props }: TgUsdMarketRepayPageProps) {
  // Fetch data here if needed
  return (
    <div {...props}>
      <h1>TgUsdMarketRepayPage</h1>
      <p>This is a server-side component.</p>
    </div>
  )
}
