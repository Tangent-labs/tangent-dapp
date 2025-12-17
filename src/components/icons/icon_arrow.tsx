interface IconProps {
  className?: string
}

export function IconArrow({ className }: IconProps) {
  return (
    <svg className={className || ""} width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.146447 6.14645C-0.0488155 6.34171 -0.0488155 6.65829 0.146447 6.85355C0.341709 7.04882 0.658291 7.04882 0.853553 6.85355L0.5 6.5L0.146447 6.14645ZM7 0.5C7 0.223858 6.77614 0 6.5 0H2C1.72386 0 1.5 0.223858 1.5 0.5C1.5 0.776142 1.72386 1 2 1H6V5C6 5.27614 6.22386 5.5 6.5 5.5C6.77614 5.5 7 5.27614 7 5V0.5ZM0.5 6.5L0.853553 6.85355L6.85355 0.853553L6.5 0.5L6.14645 0.146447L0.146447 6.14645L0.5 6.5Z"
        fill="#9B9B9B"
      />
    </svg>
  )
}
