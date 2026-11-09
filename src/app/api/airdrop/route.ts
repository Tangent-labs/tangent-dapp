import { isAddress } from "viem"
import { NextRequest, NextResponse } from "next/server"
import airdrop from "@/data/airdrop.json"
import type { AirdropAllocationResponse, AirdropData, AirdropRecipient } from "@/components/products/usg/airdrop/claim/usg_claim_airdrop_controller"

// The allocation file is large (~0.5 MB): keep it server-side and only send the summary + the requested wallet.
const data = airdrop as unknown as AirdropData

const recipientsByAddress = new Map<string, AirdropRecipient>(data.recipients.map((r) => [r.address.toLowerCase(), r]))

export async function GET(request: NextRequest) {
  const user = request.nextUrl.searchParams.get("user")

  if (user && !isAddress(user)) {
    return NextResponse.json({ error: "Invalid user param" }, { status: 400 })
  }

  const response: AirdropAllocationResponse = {
    generatedAt: data.generatedAt,
    summary: data.summary,
    recipient: user ? (recipientsByAddress.get(user.toLowerCase()) ?? null) : null,
  }

  return NextResponse.json(response)
}
