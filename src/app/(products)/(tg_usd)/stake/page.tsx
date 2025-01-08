import React from "react"

type TgUsdStakePageProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default async function TgUsdStakePage({ ...props }: TgUsdStakePageProps) {
  // Fetch data here if needed
  return (
    <div {...props}>
      <h1>TgUsdStakePage</h1>
      <p>This is a server-side component.</p>
    </div>
  )
}
