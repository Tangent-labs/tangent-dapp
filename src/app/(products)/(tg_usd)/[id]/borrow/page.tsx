import React from "react"

type TgUsdMarketBorrowPageProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default async function TgUsdMarketBorrowPage({ ...props }: TgUsdMarketBorrowPageProps) {
  // Fetch data here if needed
  return (
    <div {...props}>
      <h1>TgUsdMarketBorrowPage</h1>
      <p>This is a server-side component.</p>
    </div>
  )
}
