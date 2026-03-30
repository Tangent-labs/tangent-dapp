import type { Metadata } from "next"

import "@/css_globals.css"

import { gilroy } from "./fonts"

export const metadata: Metadata = {
  title: "Tangent Finance",
  description: "Tangent Finance dApp",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={gilroy.variable} suppressHydrationWarning>
      <body className="dark relative bg-dark font-gilroy antialiased" id="body" suppressHydrationWarning>
        {/* <div className="fixed inset-0 -z-30 bg-body"></div>  */}
        <main className="overflow-y-overlay mx-auto min-h-[80vh] w-full">{children}</main>
      </body>
    </html>
  )
}
