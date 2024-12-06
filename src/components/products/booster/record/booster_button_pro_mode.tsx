"use client"

import React from "react"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import { useBoosterRecordContext } from "@/components/products/booster/record/booster_record_context"

export default function BoosterButtonProMode() {
  const { isProMode, setIsProMode, positionCount } = useBoosterRecordContext()
  return (
    <>
      <ButtonTab disabled={positionCount > 1} active={!isProMode} label={"Easy"} onClick={() => setIsProMode(false)} />
      <ButtonTab active={isProMode} label={"Pro"} onClick={() => setIsProMode(true)} />
    </>
  )
}
