"use client"

import { ReactNode, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/design_system/inputs/button"
import { SliderInput } from "@/components/design_system/inputs/SliderInput"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

/** Everything comes from VAPRCalculator (record context + its own save logic). This file is markup only. */
export type VAPRCalculatorV2Props = {
  metrics: Record<string, string>
  chartData?: Array<{ price: number; vAPR: number }>
  usgPrice?: number
  isLeveraged: boolean
  setIsLeveraged: (v: boolean) => void
  initialCollatAmount: number
  setInitialCollatAmount: (v: number) => void
  totalCollatAmount: number
  setTotalCollatAmount: (v: number) => void
  simulatedCollatAmount?: number
  setSimulatedCollatAmount: (v: number) => void
  debtFarming: number
  setDebtFarming: (v: number) => void
  debtVAPR: number
  setDebtVAPR: (v: number) => void
  onSave: () => void
}

const TICK = { fontSize: 11, fill: "rgba(255,255,255,0.45)" }
const clampPct = (v: number) => Math.min(100, Math.max(0, v))

export function VAPRCalculatorV2(p: VAPRCalculatorV2Props) {
  const [open, setOpen] = useState(false)
  const net = p.metrics["Net vAPR"]
  const netNumber = parseFloat(net)

  return (
    <div className="rounded-2xl border border-hairline bg-surface">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <span className="text-[15px] font-semibold">vAPR calculator</span>
        <span className="hidden text-[13px] text-ink-2 sm:inline">Net vAPR of a position across USG prices</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="text-[13px] tabular-nums text-ink-2">
            At ${p.usgPrice?.toFixed(4) ?? "-"}: <span className={cn("font-medium", netNumber < 0 ? "text-negative" : "text-white")}>{net}</span>
          </span>
          <ChevronDown className={cn("h-4 w-4 text-ink-3 transition-transform duration-200", open && "rotate-180")} strokeWidth={2} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { type: "spring", visualDuration: 0.35, bounce: 0.05 }, opacity: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-6 border-t border-divider p-5 lg:grid-cols-[260px_minmax(0,1fr)]">
              {/* left: the position you simulate */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2.5">
                  <Label text="Leveraged position" info="Simulate a leveraged position where borrowed USG is used to buy additional collateral." />
                  <Switch checked={p.isLeveraged} onCheckedChange={p.setIsLeveraged} />
                </div>

                {p.isLeveraged ? (
                  <>
                    <Field label="Initial collateral" info="The value of the collateral you deposited first, without leverage." prefix="$">
                      <NumberInput value={p.initialCollatAmount} onChange={p.setInitialCollatAmount} />
                    </Field>
                    <Field label="Total collateral" info="Total collateral farming." prefix="$">
                      <NumberInput value={p.totalCollatAmount} onChange={p.setTotalCollatAmount} />
                    </Field>
                  </>
                ) : (
                  <Field label="Collateral" info="The USD value of collateral deposited in this position." prefix="$">
                    <NumberInput value={p.simulatedCollatAmount ? Number(p.simulatedCollatAmount.toFixed(0)) : 0} onChange={p.setSimulatedCollatAmount} />
                  </Field>
                )}

                <Field label="Debt farming" info="Share of the total debt currently yielding." prefix="$">
                  <NumberInput value={p.debtFarming} onChange={p.setDebtFarming} />
                </Field>

                <Field label="Debt farming vAPR" info="The vAPR earned on the debt-farming amount above." suffix="%">
                  <NumberInput value={p.debtVAPR} onChange={(v) => p.setDebtVAPR(clampPct(v))} />
                </Field>
                <div className="-mt-1 px-1">
                  <SliderInput
                    value={p.debtVAPR}
                    handleSliderChange={(e) => p.setDebtVAPR(clampPct(Number(e?.target?.value)))}
                    legendValues={["0", "25", "50", "75", "100"]}
                    startEndRange={["0", "100", "1"]}
                    unit="%"
                  />
                </div>

                <Button onClick={p.onSave}>Save and compute</Button>
                <p className="text-xs leading-relaxed text-ink-3">
                  Exact for leveraged positions whose debt is fully converted to collateral. If you farm your debt elsewhere, keep the two debt fields up to
                  date.
                </p>
              </div>

              {/* right: results first, then the curve */}
              <div className="min-w-0">
                <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-4">
                  {Object.entries(p.metrics).map(([label, value], i) => (
                    <div key={label} className="bg-surface px-4 py-3">
                      <div className="text-xs text-ink-3">{label}</div>
                      <div
                        className={cn(
                          "mt-1 tabular-nums tracking-[-0.02em]",
                          i === 0 ? "text-[22px] font-light" : "text-[17px] font-medium",
                          i === 0 && netNumber < 0 && "text-negative"
                        )}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between text-xs text-ink-2">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-action" /> Net vAPR by USG price
                  </span>
                  <span className="flex items-center gap-1.5 text-ink-3">
                    <span className="h-px w-3 border-t border-dashed border-white/50" /> Current USG price
                  </span>
                </div>

                <div className="mt-2 h-[300px] w-full">
                  {p.chartData?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={p.chartData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="v2-vapr-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0075FF" stopOpacity={0.22} />
                            <stop offset="100%" stopColor="#0075FF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid horizontal vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="price"
                          type="number"
                          reversed
                          domain={[1.005, 0.9897]}
                          ticks={Array.from({ length: 7 }, (_, i) => Number((0.99 + i * 0.0025).toFixed(4)))}
                          tickFormatter={(v) => `$${Number(v).toFixed(4)}`}
                          tick={TICK}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={8}
                        />
                        <YAxis tickFormatter={(v) => `${Number(v).toFixed(1)}%`} tick={TICK} axisLine={false} tickLine={false} width={48} />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" />
                        {p.usgPrice !== undefined && (
                          <ReferenceLine
                            x={p.usgPrice}
                            stroke="rgba(255,255,255,0.5)"
                            strokeDasharray="3 3"
                            label={{ value: `$${p.usgPrice.toFixed(4)}`, position: "insideTopLeft", fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                          />
                        )}
                        <Tooltip
                          cursor={{ stroke: "rgba(255,255,255,0.15)" }}
                          content={({ active, payload, label }) =>
                            active && payload?.length ? (
                              <div className="rounded-lg border border-white/10 bg-[#1a1a1d] px-3 py-2 text-xs shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
                                <div className="text-ink-3">USG at ${Number(label).toFixed(4)}</div>
                                <div className="mt-0.5 font-medium tabular-nums">{Number(payload[0]?.value).toFixed(2)}% net vAPR</div>
                              </div>
                            ) : null
                          }
                        />
                        <Area type="monotone" dataKey="vAPR" stroke="none" fill="url(#v2-vapr-fill)" isAnimationActive={false} />
                        <Line
                          type="monotone"
                          dataKey="vAPR"
                          stroke="#0075FF"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 3.5, fill: "#0075FF", stroke: "#fff" }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="grid h-full place-items-center rounded-xl border border-dashed border-hairline text-[13px] text-ink-3">
                      Enter a collateral value to see the curve.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Label({ text, info }: { text: string; info: string }) {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="cursor-help text-[13px] text-ink-2 underline decoration-white/20 decoration-dotted underline-offset-4">{text}</span>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="z-[9999] w-fit max-w-56 rounded-lg border-white/10 bg-[#1a1a1d] p-2 text-xs">
        {info}
      </HoverCardContent>
    </HoverCard>
  )
}

function Field({ label, info, prefix, suffix, children }: { label: string; info: string; prefix?: string; suffix?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <Label text={label} info={info} />
      <span className="flex h-10 items-center gap-1.5 rounded-lg border border-hairline bg-white/[0.04] px-3 text-[14px] transition-colors focus-within:border-white/20">
        {prefix && <span className="text-ink-3">{prefix}</span>}
        {children}
        {suffix && <span className="text-ink-3">{suffix}</span>}
      </span>
    </label>
  )
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      placeholder="0"
      value={value || ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full min-w-0 bg-transparent tabular-nums text-white outline-none [appearance:textfield] placeholder:text-ink-3 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
  )
}
