"use client"

interface BorderPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export default function BorderPanel({ children, className, ...props }: BorderPanelProps) {
  return (
    <div className={`rounded-[10px] border-white border-opacity-20 ${className}`} {...props} style={{ borderWidth: 1.5, borderStyle: "solid" }}>
      {children}
    </div>
  )
}
