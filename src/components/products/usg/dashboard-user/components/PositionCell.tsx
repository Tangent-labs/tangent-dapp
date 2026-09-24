import { cn } from "@/lib/utils"

type PositionCellProps = {
  label: string
  className?: string
  children: React.ReactNode
}

// On mobile each value gets its label, on desktop the table header plays that role
export const PositionCell = ({ label, className, children }: PositionCellProps) => (
  <div className={cn("flex w-full items-center justify-between gap-2 xl:flex-1 xl:justify-center", className)}>
    <span className="text-sm text-subtitle xl:hidden">{label}</span>
    <span className="flex items-center justify-center text-sm xl:text-[15px]">{children}</span>
  </div>
)
