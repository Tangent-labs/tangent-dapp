interface MarketListRowProps {
  children: React.ReactNode[]
  rowDisposition: React.ComponentType<{ children: React.ReactNode[] }>
  className?: string
  navigate?: () => void
  isSelected?: boolean
}

export const MarketListRow = ({ children, navigate, className = "", rowDisposition: CustomRowDisposition, isSelected = false }: MarketListRowProps) => {
  return (
    <div
      onClick={() => navigate && navigate()}
      className={`relative bg-overlay-panel px-2 py-1.5 backdrop-blur-[60px] before:absolute before:inset-0 before:-z-10 before:opacity-70 hover:cursor-pointer hover:before:bg-list-row-hover lg:px-4 ${isSelected ? "before:bg-list-row-hover" : ""} // Selected state styling ${className} `}
    >
      <CustomRowDisposition>
        <> {children?.at(0)}</>
        <> {children?.at(1)}</>
        <> {children?.at(2)}</>
        <> {children?.at(3)}</>
      </CustomRowDisposition>
    </div>
  )
}
