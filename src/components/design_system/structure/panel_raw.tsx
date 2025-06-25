"use client"

interface PanelRawProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export default function PanelRaw({ children, className, ...props }: PanelRawProps) {
  return (
    <div style={{ borderWidth: 1.5 }} className={`rounded-[10px] border-white border-opacity-20 bg-overlay-panel backdrop-blur-[60px] ${className}`} {...props}>
      {children}
    </div>
  )
}
