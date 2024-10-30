import { Button } from "@/components/design_system/inputs/button"
import { useWalletConnexionContext } from "../../wallet/wallet_connexion_context"
import { executeTransaction, getApproveTx, getWalletClient } from "@/services/service_rpc"
import { TOKEN_ADDR } from "@/services/repo_asset_addresses"

export default function SplitterRecordClaim() {
  const { currentWallet } = useWalletConnexionContext()

  const onclick = () => {
    if (!currentWallet) return
    const tx = getApproveTx(TOKEN_ADDR.WETH, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 10000000n)
    getWalletClient(currentWallet).then((c) => {
      if (!c) return
      executeTransaction(c, tx).then(console.error)
    })
  }

  return (
    <div>
      <div>BoosterRecordClaim</div>

      <Button label="Approve" onClick={onclick} />
    </div>
  )
}
