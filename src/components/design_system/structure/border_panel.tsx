"use client"

interface BorderPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function BorderPanel({ children, className, ...props }: BorderPanelProps) {
  return (
    <div className={`rounded-[10px] border-tangent border-white border-opacity-20 ${className}`} {...props}>
      {children}
    </div>
  )
}
