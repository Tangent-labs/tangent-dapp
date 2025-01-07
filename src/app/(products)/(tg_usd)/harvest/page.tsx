import React from "react"

type TgUsHarvetPageProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default async function TgUsHarvetPage({ ...props }: TgUsHarvetPageProps) {
  // Fetch data here if needed
  return (
    <div {...props}>
      <h1>TgUsHarvetPage</h1>
      <p>This is a server-side component.</p>
    </div>
  )
}
