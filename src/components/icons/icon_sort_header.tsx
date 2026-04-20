interface IconProps {
  className?: string
  sort?: "asc" | "desc" | "none"
}

export function IconSortHeader({ className = "", sort = "none" }: IconProps) {
  return (
    <svg className={className || ""} width="9" height="15" viewBox="0 0 9 15" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 11L4.5 14L8 11" stroke={sort === "asc" ? "currentColor" : "gray"} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 4L4.5 1L1 4" stroke={sort === "desc" ? "currentColor" : "gray"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
