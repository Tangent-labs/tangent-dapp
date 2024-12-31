import React from "react"

type tgUsdMarketPageProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default async function tgUsdMarketPage({ ...props }: tgUsdMarketPageProps) {
  // Fetch data here if needed
  return (
    <div {...props}>
      <h1>tgUsdMarketPage</h1>
      <p>This is a server-side component.</p>
    </div>
  )
}
