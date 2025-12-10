interface IconProps {
  className?: string
}

export function IconHarvest({ className }: IconProps) {
  return (
    <svg className={className || ""} width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 7.66667V11.8333C11 13.214 8.76142 14.3333 6 14.3333C3.23858 14.3333 1 13.214 1 11.8333V7.66667M11 7.66667V3.5M11 7.66667C11 9.04738 8.76142 10.1667 6 10.1667C3.23858 10.1667 1 9.04738 1 7.66667M11 3.5C11 2.11929 8.76142 1 6 1C3.23858 1 1 2.11929 1 3.5M11 3.5C11 4.88071 8.76142 6 6 6C3.23858 6 1 4.88071 1 3.5M1 7.66667V3.5"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
