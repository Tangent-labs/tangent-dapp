"use client"

interface PanelRawProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export default function PanelRaw({ children, className, ...props }: PanelRawProps) {
  return (
    <div className={`rounded-[10px] border border-white border-opacity-25 bg-white bg-opacity-[3%] backdrop-blur-[30px] ${className}`} {...props}>
      {children}
    </div>
  )
}
