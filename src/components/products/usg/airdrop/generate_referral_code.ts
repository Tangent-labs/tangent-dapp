"use server"

import { Address } from "viem"

export const generateCode = async (account: Address): Promise<string> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100"

  try {
    const response = await fetch(`${baseUrl}/referral/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${process.env.SECRET_TOKEN}`,
      },
      body: JSON.stringify({ account }),
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Referral code creation failed with status ${response.status}`)
    }

    const data = await response.json()

    return data.message as string
  } catch {
    throw new Error("Referral code creation failed with status")
  }
}
