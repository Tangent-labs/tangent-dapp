"use client"

import Title from "@/components/design_system/structure/title"
import { useBoosterRecordContext } from "./booster_record_context"

import AprBlock from "@/components/design_system/structure/apr_block"

export default function BoosterRecordApr() {
  const { apr } = useBoosterRecordContext()

  return (
    <div className="flex flex-col gap-8">
      <Title label="APR BREAKDOWN" size={"normal"} />
      <AprBlock aprEntry={apr?.actualsApr} title="Current APR" />
      <AprBlock aprEntry={apr?.projectedApr} title="Projected APR" />
    </div>
  )
}
