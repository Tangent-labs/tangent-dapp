"use client"

interface ButtonDivProps {
  children?: React.ReactNode
  className?: string
  active?: boolean
}

export default function ButtonDiv({ children, className, active }: ButtonDivProps) {
  return (
    <div
      className={`   data-[state=active]:bg-white  data-[state=active]:text-black data-state= ${active ? "bg-white text-black" : "border-gray-400 hover:bg-white hover:bg-opacity-[3%] "}   border-gray-400    ${className}`}
    >
      {children}
    </div>
  )
}
