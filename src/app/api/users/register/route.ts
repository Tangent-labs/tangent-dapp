"use server"

export async function POST(req: Request) {
  const { address } = await req.json()

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100"

  const res = await fetch(`${baseUrl}/user/register`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.SECRET_TOKEN}`,
    },
    body: JSON.stringify({ address }),
    cache: "no-store",
  })

  return new Response(await res.text(), { status: res.status, headers: { "content-type": "application/json" } })
}
