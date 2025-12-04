"use client"

import { Button } from "@/components/design_system/inputs/button"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center gap-4">
        <Image height={140} width={140} src="/medias/tokens/USG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

        <div className="flex flex-col items-center justify-center gap-4">
          <h2>This page does not exist</h2>

          <Button className="flex w-full justify-center text-lg font-semibold text-white" onClick={() => router.push("/")}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  )
}
