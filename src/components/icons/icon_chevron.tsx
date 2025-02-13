interface IconProps {
  className?: string
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg width="9" height="5" className={className || ""} viewBox="0 0 9 5" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L4.5 4L8 1" stroke="#9B9B9B" strokeLinecap="round" />
    </svg>
  )
}
