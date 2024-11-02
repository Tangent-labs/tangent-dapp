"use client"
import { BoosterExistingAsset } from "@/components/products/booster/booster_type"
import { useParams } from "next/navigation"

export default function Page() {
  const { id } = useParams<{ id: BoosterExistingAsset }>()
  return <div>SDTOKEN BOOSTER DETAIL DEPOSIT {id}</div>
}
