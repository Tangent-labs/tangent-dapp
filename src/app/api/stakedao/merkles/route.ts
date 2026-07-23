import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const user = request.nextUrl.searchParams.get("user")
  if (!user) {
    return NextResponse.json({ error: "Missing 'user' query param" }, { status: 400 })
  }

  const res = await fetch(`https://hub.stakedao.org/v1/merkles?user=${user}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch StakeDao merkle data" }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
