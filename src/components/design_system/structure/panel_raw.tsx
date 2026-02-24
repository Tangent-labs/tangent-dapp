"use client"

interface PanelRawProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function PanelRaw({ children, className, ...props }: PanelRawProps) {
  return (
    <div className={`rounded-[10px] border-tangent border-white border-opacity-20 bg-white bg-opacity-[3%] ${className}`} {...props}>
      {children}
    </div>
  )
}
