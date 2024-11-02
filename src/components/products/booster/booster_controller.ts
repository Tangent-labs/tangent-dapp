import { _getApr } from "@/services/service_api"
import { BoosterExistingAsset } from "./booster_type"
import { boosterStakingInfos } from "./booster_repository"
import { AssetApr } from "@/types"
import { Address } from "viem"

export const getBoosterApr = async (existing?: BoosterExistingAsset) => {
  const aprs = await _getApr()

  const matchAddresses: Partial<Record<BoosterExistingAsset, Address>> = existing
    ? { [existing]: boosterStakingInfos[existing].gaugeAsset }
    : {
        BAL: boosterStakingInfos.BAL.gaugeAsset,
        FXN: boosterStakingInfos.FXN.gaugeAsset,
        PENDLE: boosterStakingInfos.PENDLE.gaugeAsset,
        CRV: boosterStakingInfos.CRV.gaugeAsset,
      }

  const datas = Object.entries(matchAddresses).reduce<Record<BoosterExistingAsset, AssetApr>>(
    (agg, [k, v]) => {
      const aprRow: AssetApr = {}
      if (aprs.actualsApr[v]) {
        aprRow.actualsApr = aprs.actualsApr[v]
      }
      if (aprs.boostsData[v]) {
        aprRow.boostsData = aprs.boostsData[v]
      }
      if (aprs.projectedApr[v]) {
        aprRow.projectedApr = aprs.projectedApr[v]
      }
      agg[k as BoosterExistingAsset] = aprRow
      return agg
    },
    {} as Record<BoosterExistingAsset, AssetApr>
  )
  return datas
}
