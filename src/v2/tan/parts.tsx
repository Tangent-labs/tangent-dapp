"use client"

import { ReactNode } from "react"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { LockData } from "@/components/products/usg/usg_type"
import { formatBigInt } from "@/lib/number_formatter"
import { FormAlert } from "@/components/design_system/inputs/form_alert"
import { SelectMenu } from "@/v2/ui/select-menu"

/** One lock position as a select option: "#12" with its vsTAN amount as a hint. */
export function positionOptions(lockData: LockData | undefined, extra: { value: string; label: string }[] = []) {
  return [
    ...extra,
    ...(lockData?.positions ?? []).map((p) => ({ value: p.tokenId.toString(), label: `#${p.tokenId}`, hint: `${formatBigInt(p.amount, 18, 2)} vsTAN` })),
  ]
}

/** Single position picker. Same value and setter as the live InputSelect (a tokenId as a string). */
export function PositionPicker({
  value,
  onChange,
  lockData,
  extra,
  className,
}: {
  value: string
  onChange: (v: string) => void
  lockData: LockData | undefined
  extra?: { value: string; label: string }[]
  className?: string
}) {
  const options = positionOptions(lockData, extra)
  return (
    <SelectMenu
      label=""
      value={value || (extra?.[0]?.value ?? "")}
      options={options}
      onChange={onChange}
      className={cn("h-11 w-full justify-start [&>svg]:ml-auto", className)}
    />
  )
}

export function Field({ label, aside, children }: { label: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-2">
        <span className="text-[13px] font-medium text-ink-2">{label}</span>
        {aside && <span className="text-xs text-ink-3">{aside}</span>}
      </div>
      {children}
    </div>
  )
}

export function Recap({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6 border-t border-divider pt-5">
      <div className="mb-3 text-[13px] font-medium text-ink-2">{title}</div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

export function Row({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="text-ink-3">{label}</span>
      <span className={cn("flex items-center gap-1.5 tabular-nums", strong && "text-[15px] font-semibold")}>{value}</span>
    </div>
  )
}

export function Note({ children, learnMore }: { children: ReactNode; learnMore?: boolean }) {
  return (
    <p className="mt-5 text-xs leading-relaxed text-ink-3">
      {children}
      {learnMore && (
        <a
          href="https://youtu.be/5Hplx-geZHo?t=5"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 inline-flex items-center gap-1 underline decoration-white/20 underline-offset-2 hover:text-white"
        >
          Learn more <ExternalLink className="h-3 w-3" strokeWidth={2} />
        </a>
      )}
    </p>
  )
}

export function Alerts({ errors, isLoading }: { errors: { type: string | null; key: string }[]; isLoading?: boolean }) {
  return (
    <>
      {errors
        .filter((e) => e.type === "form-alert")
        // the live FormAlert takes the whole error object
        .map((error) => (
          <FormAlert key={error.key} error={error as never} className="mt-4" isLoading={!!isLoading} />
        ))}
    </>
  )
}

export function Empty({ text }: { text: string }) {
  return <p className="rounded-xl bg-white/[0.03] px-4 py-5 text-center text-[13px] text-ink-3">{text}</p>
}
