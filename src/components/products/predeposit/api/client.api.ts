import { Address } from "viem"
import { PredepositRawState } from "../types/types"

export interface UserStatus {
  hasUsedCode: boolean
  referralCode: string | null
  friends: number
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100"

export const fetchUserStatus = async (account: Address) => {
  try {
    const url = `${baseUrl}/predeposit/${account}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch predeposit status")
    }

    const data: PredepositRawState = await response.json()

    return data
  } catch (error) {
    console.error("Failed to fetch predeposit status:", error)
    return null
  }
}

export const validatePredepositSignature = async (signature: string, currentAddress: Address, now: Date) => {
  try {
    const url = `${baseUrl}/predeposit/sign`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ signature, account: currentAddress, now }),
    })

    if (!response.ok) {
      throw new Error("Failed to sign predeposit message")
    }

    const data: string = await response.json()

    return data
  } catch (error) {
    console.error("Failed to sign predeposit message:", error)
    return null
  }
}
