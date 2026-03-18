import { IconSingleArrow } from "@/components/icons"
import { cn } from "@/lib/utils"

import { Divider } from "./divider"
import { ReliefCard } from "./relief_card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export type AprVariation = { current: string; currentUpdated: string; projected: string; projectedUpdated: string }

export type KeyValue = {
  label: string
  value: string
}
export type SwapRecapParams = {
  isDisplayed: boolean
  leverage?: number
  label: string
  expected: string | undefined
  minOut: string | undefined
  slippage: number | undefined
}
export type Recap = {
  isLoading: boolean
  zappingParams?: SwapRecapParams
  aprVariationParams?: AprVariation
  className?: string
}
export function RecapAccordion({ isLoading, zappingParams, aprVariationParams, className }: Recap) {
  return (
    <Accordion className={`w-full ${className}`} type="single" collapsible>
      <AccordionItem value="item-1">
        <ReliefCard className="flex cursor-pointer flex-col px-2 text-xs text-primary hover:bg-panel-hover">
          <AccordionTrigger>Recap</AccordionTrigger>

          <AccordionContent className="w-full">
            <div className={cn("flex flex-col gap-0.5 rounded-[10px] text-xs", isLoading ? "shimmer" : "")}>
              {zappingParams && zappingParams.isDisplayed && (
                <>
                  {zappingParams.leverage && (
                    <div className="flex w-full items-center justify-between">
                      <span className="text-subtitle">Leverage : </span>
                      <span className="text-white">~{zappingParams.leverage.toFixed(2)}x</span>
                    </div>
                  )}
                  <div className={cn("flex items-center justify-between")}>
                    <span className="text-subtitle">Slippage: </span>
                    <span className="font-semibold text-white">{zappingParams.slippage}%</span>
                  </div>
                  <div className={cn("flex items-center justify-between")}>
                    <span className="text-subtitle">Expected {zappingParams?.label} </span>
                    <span className="font-semibold text-white">{zappingParams.expected}</span>
                  </div>
                  <div className={cn("flex items-center justify-between")}>
                    <span className="text-subtitle">Minimum {zappingParams.label}: </span>
                    <span className="font-semibold text-white">{zappingParams.minOut}</span>
                  </div>
                  <Divider className="my-[3px]" />
                </>
              )}

              {aprVariationParams && (
                <>
                  <div className="flex w-full items-center justify-between">
                    <span className="text-subtitle">APR variation : </span>
                  </div>

                  <div className="flex w-full items-center justify-between">
                    <span className="ml-4 italic text-subtitle">Current </span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-white">{aprVariationParams.current}</span>
                      <IconSingleArrow></IconSingleArrow>
                      <span className="text-tonic">{aprVariationParams.currentUpdated}</span>
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between">
                    <span className="ml-4 italic text-subtitle">Projected </span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-white">{aprVariationParams.projected}</span>
                      <IconSingleArrow></IconSingleArrow>
                      <span className="text-tonic">{aprVariationParams.projectedUpdated}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </ReliefCard>
      </AccordionItem>
    </Accordion>
  )
}
