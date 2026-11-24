import { cn } from "@/lib/utils"
import { UI_V2 } from "@/v2/ui"

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
  minOut?: string | undefined
  liquidateMinOut?: string | undefined
  slippage: number | undefined
  priceImpact: number
  usgRepaidFromWallet?: string | undefined
  usgRepaidFromCollateral?: string | undefined
  usgRefund?: string | undefined
}
export type Recap = {
  isDisplayed: boolean
  isLoading?: boolean
  zappingParams?: SwapRecapParams
  className?: string
  // aprVariationParams?: AprVariation
}
/**
 * V2 recap: a quiet collapsible block. Label left, value right; "a + b = total unit" values show the total, with the sum
 * underneath in small grey. The key figure (leverage, else slippage) stays visible on the closed header.
 */
function RecapV2({ isLoading, isDisplayed, zappingParams, className }: Recap) {
  if (!zappingParams) return null
  const z = zappingParams
  const split = (v?: string) => {
    if (!v) return { main: "-", sum: undefined as string | undefined }
    const i = v.lastIndexOf(" = ")
    return i > 0 ? { main: v.slice(i + 3), sum: v.slice(0, i) } : { main: v, sum: undefined }
  }
  const rows: { label: string; value?: string; strong?: boolean; loading?: boolean }[] = [
    ...(z.leverage ? [{ label: "Leverage", value: "~" + z.leverage.toFixed(2) + "x" }] : []),
    { label: "Slippage", value: z.slippage + "%" },
    ...(z.priceImpact >= 0.1 ? [{ label: "Price impact", value: z.priceImpact.toFixed(2) + "%", loading: true }] : []),
    { label: "Expected " + (z.label ?? ""), value: z.expected, strong: true, loading: true },
    ...(z.minOut ? [{ label: "Minimum " + (z.label ?? ""), value: z.minOut, loading: true }] : []),
    ...(z.liquidateMinOut ? [{ label: "Minimum USG received", value: z.liquidateMinOut, loading: true }] : []),
    ...(z.usgRepaidFromCollateral ? [{ label: "USG repaid from collateral", value: z.usgRepaidFromCollateral, loading: true }] : []),
    ...(z.usgRepaidFromWallet ? [{ label: "USG repaid from wallet", value: z.usgRepaidFromWallet, loading: true }] : []),
    ...(z.usgRefund ? [{ label: "Minimum USG refunded", value: z.usgRefund, loading: true }] : []),
  ]
  const key = z.leverage ? "~" + z.leverage.toFixed(2) + "x" : z.slippage + "% slippage"
  return (
    <Accordion className={cn("w-full", className, !isDisplayed && "hidden")} type="single" collapsible>
      <AccordionItem value="recap" className="rounded-[10px] border border-hairline px-3">
        <AccordionTrigger className="group h-10 py-0 text-[13px] font-medium text-ink-2 hover:text-white [&>svg]:ml-2 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-ink-3">
          <span>Recap</span>
          <span className="ml-auto text-[13px] font-normal tabular-nums text-ink-3 group-data-[state=open]:opacity-0">{key}</span>
        </AccordionTrigger>
        <AccordionContent className="pb-3">
          <div className="space-y-2.5 border-t border-divider pt-3">
            {rows.map(({ label, value, strong, loading }) => {
              const { main, sum } = split(value)
              return (
                <div key={label} className="flex items-start justify-between gap-4 text-[12px] leading-4">
                  <span className="shrink-0 text-ink-3">{label}</span>
                  <span className={cn("min-w-0 text-right tabular-nums", isLoading && loading && "animate-pulse text-ink-3")}>
                    <span className={cn("block", strong ? "font-medium text-white" : "text-ink-2")}>{main}</span>
                    {sum && <span className="mt-0.5 block text-[11px] text-ink-3">{sum}</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function RecapAccordion({ isLoading, isDisplayed, zappingParams, className }: Recap) {
  if (UI_V2) return <RecapV2 isLoading={isLoading} isDisplayed={isDisplayed} zappingParams={zappingParams} className={className} />
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
                      <span className="text-subtitle">Leverage: </span>
                      <span className={cn("text-white")}>~{zappingParams.leverage.toFixed(2)}x</span>
                    </div>
                  )}
                  <div className={cn("flex items-center justify-between")}>
                    <span className="text-subtitle">Slippage: </span>
                    <span className="font-semibold text-white">{zappingParams.slippage}%</span>
                  </div>

                  {zappingParams.priceImpact >= 0.1 && (
                    <div className={cn("flex items-center justify-between", isLoading ? "shimmer" : "")}>
                      <span className="text-subtitle">Price impact: </span>
                      <span className="font-semibold text-white">{zappingParams.priceImpact?.toFixed(2)}%</span>
                    </div>
                  )}

                  <div className={cn("flex items-center justify-between", isLoading ? "shimmer" : "")}>
                    <span className="text-subtitle">Expected {zappingParams?.label}: </span>
                    <span className="text-white">{zappingParams.expected}</span>
                  </div>

                  {zappingParams?.minOut && (
                    <div className={cn("flex items-center justify-between", isLoading ? "shimmer" : "")}>
                      <span className="text-subtitle">Minimum {zappingParams.label}: </span>
                      <span className="text-white">{zappingParams?.minOut}</span>
                    </div>
                  )}

                  {zappingParams?.liquidateMinOut && (
                    <div className={cn("flex items-center justify-between", isLoading ? "shimmer" : "")}>
                      <span className="text-subtitle">Minimum USG received: </span>
                      <span className="text-white">{zappingParams?.liquidateMinOut}</span>
                    </div>
                  )}

                  {zappingParams?.usgRepaidFromCollateral && (
                    <div className={cn("flex items-center justify-between", isLoading ? "shimmer" : "")}>
                      <span className="text-subtitle">USG repaid from collateral: </span>
                      <span className="text-white">{zappingParams?.usgRepaidFromCollateral}</span>
                    </div>
                  )}

                  {zappingParams?.usgRepaidFromWallet && (
                    <div className={cn("flex items-center justify-between", isLoading ? "shimmer" : "")}>
                      <span className="text-subtitle">USG repaid from wallet: </span>
                      <span className="text-white">{zappingParams?.usgRepaidFromWallet}</span>
                    </div>
                  )}

                  {zappingParams?.usgRefund && (
                    <div className={cn("flex items-center justify-between", isLoading ? "shimmer" : "")}>
                      <span className="text-subtitle">Minimum USG refunded to your wallet: </span>
                      <span className="text-white">{zappingParams?.usgRefund}</span>
                    </div>
                  )}
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
