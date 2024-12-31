import React from "react"

type TgUsdPointsProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default async function TgUsdPointsPage({ ...props }: TgUsdPointsProps) {
  // Fetch data here if needed
  return (
    <div {...props}>
      <h1>TgUsdPointsPage</h1>
      <p>This is a server-side component.</p>
    </div>
  )
}
