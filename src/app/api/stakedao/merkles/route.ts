import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const user = request.nextUrl.searchParams.get("user")

  if (!user?.startsWith("0x")) {
    return NextResponse.json({ error: "Invalid user param" }, { status: 400 })
  }

  try {
    const apiUrl = `https://hub.stakedao.org/v1/merkles?user=${encodeURIComponent(user)}`

    const res = await fetch(apiUrl, {
      next: { revalidate: 60 },
      headers: {
        "User-Agent": "Tangent-Finance-App/1.0 (+https://app.tangent.finance)",
        Accept: "application/json",
        Origin: "https://app.tangent.finance",
      },
    })

    if (!res.ok) {
      console.error(`StakeDAO returned ${res.status}:`, await res.text().catch(() => "no body"))
      return NextResponse.json({ error: `StakeDAO API error: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    const e = err as { message: string }
    console.error("Proxy error:", e.message)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
