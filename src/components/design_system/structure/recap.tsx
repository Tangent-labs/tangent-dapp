import { cn } from "@/lib/utils"

import { ReliefCard } from "./relief_card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// export type AprVariation = { current: string; currentUpdated: string; projected?: string; projectedUpdated?: string }

export type KeyValue = {
  label: string
  value: string
}
export type SwapRecapParams = {
  leverage?: number
  label?: string
  expected: string | undefined
  minOut: string | undefined
  slippage: number | undefined
}
export type Recap = {
  isDisplayed: boolean
  isLoading?: boolean
  zappingParams?: SwapRecapParams
  className?: string
  // aprVariationParams?: AprVariation
}
export function RecapAccordion({ isLoading, isDisplayed, zappingParams, className }: Recap) {
  return (
    <Accordion className={`w-full ${className} ${!isDisplayed ? "hidden" : ""}`} type="single" collapsible>
      <AccordionItem value="item-1">
        <ReliefCard className="flex flex-col px-2 text-xs text-primary">
          <AccordionTrigger className="w-full hover:text-white">Recap</AccordionTrigger>

          <AccordionContent className="w-full">
            <div className={cn("flex flex-col gap-0.5 rounded-[10px] text-xs")}>
              {/* ZAPPING DETAILS */}
              {zappingParams && (
                <>
                  {zappingParams.leverage && (
                    <div className="flex w-full items-center justify-between">
                      <span className="text-subtitle">Leverage : </span>
                      <span className={cn("text-white")}>~{zappingParams.leverage.toFixed(2)}x</span>
                    </div>
                  )}
                  <div className={cn("flex items-center justify-between")}>
                    <span className="text-subtitle">Slippage: </span>
                    <span className="font-semibold text-white">{zappingParams.slippage}%</span>
                  </div>
                  <div className={cn("flex items-center justify-between", isLoading ? "shimmer" : "")}>
                    <span className="text-subtitle">Expected {zappingParams?.label} </span>
                    <span className="text-white">{zappingParams.expected}</span>
                  </div>
                  <div className={cn("flex items-center justify-between", isLoading ? "shimmer" : "")}>
                    <span className="text-subtitle">Minimum {zappingParams.label}: </span>
                    <span className="text-white">{zappingParams.minOut}</span>
                  </div>
                </>
              )}

              {/* DIVIDER NEEDED ONLY WHEN 2 PARTS ARE HERE */}
              {/* {zappingParams && zappingParams.isDisplayed && aprVariationParams && <Divider className="my-[3px]" />} */}

              {/* APR VARIATION DETAILS */}
              {/* {aprVariationParams &&
                (aprVariationParams.projected ? (
                  // CURRENT AND PROJECTED
                  <>
                    <div className="flex w-full items-center justify-between">
                      <span className="text-subtitle">APR variation : </span>
                    </div>

                    <div className={cn("flex w-full items-center justify-between", isLoading ? "shimmer" : "")}>
                      <span className="ml-4 italic text-subtitle">Current </span>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-white">{aprVariationParams.current}</span>
                        <IconSingleArrow></IconSingleArrow>
                        <span className="text-tonic">{isLoading ? "-" : aprVariationParams.currentUpdated}</span>
                      </div>
                    </div>

                    <div className={cn("flex w-full items-center justify-between", isLoading ? "shimmer" : "")}>
                      <span className="ml-4 italic text-subtitle">Projected </span>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-white">{aprVariationParams.projected}</span>
                        <IconSingleArrow></IconSingleArrow>
                        <span className="text-tonic">{isLoading ? "-" : aprVariationParams.projectedUpdated}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  // CURRENT ONLY
                  <div className={cn("flex w-full items-center justify-between", isLoading ? "shimmer" : "")}>
                    <span className="text-subtitle">APR variation : </span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-white">{aprVariationParams.current}</span>
                      <IconSingleArrow></IconSingleArrow>
                      <span className="text-tonic">{isLoading ? "-" : aprVariationParams.currentUpdated}</span>
                    </div>
                  </div>
                ))}

                 */}
            </div>
          </AccordionContent>
        </ReliefCard>
      </AccordionItem>
    </Accordion>
  )
}
