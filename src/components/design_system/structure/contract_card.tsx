import { Address } from "viem"

import { formatAddress } from "@/lib/other_formatter"
import { dappConfig } from "@/dapp_config"
import PanelRaw from "./panel_raw"

const url = dappConfig.chain.explorerContractUrl

type ContractCardProps = {
  address: Address
  label: string
}

export default function ContractCard({ address, label }: ContractCardProps) {
  return (
    <PanelRaw className="basis-40 p-2">
      <div className="flex flex-col">
        <span className="text-base">{label}</span>
        <span className="text-sm">
          <a href={`${url}{address}`} target="_blank" rel="noreferrer">
            {formatAddress(address, 7)}
          </a>
        </span>
      </div>
    </PanelRaw>
  )
}
