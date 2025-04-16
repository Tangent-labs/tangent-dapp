type TgUsdEarnPageProps = React.ButtonHTMLAttributes<HTMLDivElement>

export default async function TgUsdEarnPage({ ...props }: TgUsdEarnPageProps) {
  // Fetch data here if needed
  return (
    <div {...props}>
      <h1>TgUsdEarnPage</h1>
      <p>This is a server-side component.</p>
    </div>
  )
}
