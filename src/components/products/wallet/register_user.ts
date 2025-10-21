"use server"

import { Address } from "viem"

export const registerUser = async (address: Address) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100"

  await fetch(`${baseUrl}/user/register`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.SECRET_TOKEN}`,
    },
    body: JSON.stringify({ address }),
    cache: "no-store",
  })
}
