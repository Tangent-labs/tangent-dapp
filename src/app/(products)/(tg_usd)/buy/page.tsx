import React from "react"

type TgUsdBuyPageProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default async function TgUsdBuyPage({ ...props }: TgUsdBuyPageProps) {
  // Fetch data here if needed
  return (
    <div {...props}>
      <h1>TgUsdBuyPage</h1>
      <p>This is a server-side component.</p>
    </div>
  )
}
