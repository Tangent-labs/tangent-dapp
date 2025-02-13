interface IconProps {
  className?: string
  sort?: "asc" | "desc" | "none" // Sort state prop
}

export function IconSortHeader({ className = "", sort = "none" }: IconProps) {
  return (
    <svg className={className || ""} width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ascending arrow */}
      <path
        d="M1 11L4.5 14L8 11"
        stroke={sort === "asc" ? "currentColor" : "gray"} // Active if sort is 'asc', gray otherwise
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Descending arrow */}
      <path
        d="M8 4L4.5 1L1 4"
        stroke={sort === "desc" ? "currentColor" : "gray"} // Active if sort is 'desc', gray otherwise
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
