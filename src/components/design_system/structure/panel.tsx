"use client"

interface PanelProps {
  children: React.ReactNode
  className?: string
}

export default function Panel({ children, className }: PanelProps) {
  return (
    <div className={` p-4 border border-white border-opacity-25 bg-white backdrop-blur-[30px] rounded-[10px] bg-opacity-[3%]  mb-2  ${className}`}>
      {children}
    </div>
  )
}
