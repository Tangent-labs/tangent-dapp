import React from "react"

type TgUsdClaimPageProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default async function TgUsdClaimPage({ ...props }: TgUsdClaimPageProps) {
  // Fetch data here if needed
  return (
    <div {...props}>
      <h1>TgUsdClaimPage</h1>
      <p>This is a server-side component.</p>
    </div>
  )
}
