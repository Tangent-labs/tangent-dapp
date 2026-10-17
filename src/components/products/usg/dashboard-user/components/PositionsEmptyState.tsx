"use client"

import Link from "next/link"
import { Button } from "@/components/design_system/inputs/button"
import { useWalletConnexionContext } from "@/components/products/wallet/wallet_connexion_context"
import { useUSGDashboardUserContext } from "../dashboard_user_context"

type PositionsEmptyStateProps = {
  // Shown when the wallet is connected but has nothing here
  message: string
  action: { label: string; href: string }
}

const ROW_COUNT = 2

// Nothing to list: faint empty rows with a message on top. Without wallet, it asks to connect one.
export const PositionsEmptyState = ({ message, action }: PositionsEmptyStateProps) => {
  const { isWalletConnected } = useUSGDashboardUserContext()
  const { connect } = useWalletConnexionContext()

  return (
    <div className="relative w-full">
      <div className="flex w-full flex-col gap-[3px]" aria-hidden>
        {Array.from({ length: ROW_COUNT }, (_, index) => (
          <div key={index} className="h-[62px] w-full bg-white/[0.03]" />
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center text-sm text-subtitle">
        {isWalletConnected ? (
          <>
            {message}
            <Link href={action.href} className="font-semibold text-white underline hover:text-white/70">
              {action.label}
            </Link>
          </>
        ) : (
          <>
            Connect your wallet to see your positions.
            <div className="mt-1 w-[160px]">
              <Button onClick={connect}>Connect wallet</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
