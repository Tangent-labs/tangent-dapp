import "@/css_globals.css"
import { dmSans, gilroy } from "./fonts"
import { UI_V2 } from "@/v2/ui"
import { ThemeScript } from "@/v2/theme/theme-script"
import { LogoRingDefs } from "@/v2/theme/logo-ring"
import type { Metadata } from "next"
import { siteUrl, socialMetadata } from "./site_metadata"

const title = "Tangent Finance"
const description =
  "Tangent is a decentralized stablecoin protocol maximizing capital efficiency. Borrow against productive collateral with interest-free option on dedicated markets."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  ...socialMetadata(title, description),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-ui={UI_V2 ? "v2" : undefined} className={UI_V2 ? dmSans.variable : gilroy.variable} suppressHydrationWarning>
      {/* V2 appearance (System / Light / Dark) is applied before the first paint */}
      {UI_V2 && (
        <head>
          <ThemeScript />
        </head>
      )}
      <body className="dark relative bg-dark font-gilroy antialiased" id="body" suppressHydrationWarning>
        {/* <div className="fixed inset-0 -z-30 bg-body"></div> */}
        {UI_V2 && <LogoRingDefs />}
        <main className="overflow-y-overlay mx-auto min-h-[80vh] w-full">{children}</main>
      </body>
    </html>
  )
}
