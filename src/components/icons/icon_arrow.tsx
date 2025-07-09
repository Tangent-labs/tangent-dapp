interface IconProps {
  className?: string
}

export function IconArrow({ className }: IconProps) {
  return (
    <svg className={className || ""} width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M3.00008 1.1648e-07L7.50008 -3.47136e-07C7.77622 -1.78548e-07 8.00008 0.223857 8.00008 0.5L8.00008 5C8.00008 5.27614 7.77622 5.5 7.50008 5.5C7.22393 5.5 7.00008 5.27614 7.00008 5L7.00008 1.70711L0.853629 7.85355C0.658367 8.04882 0.341784 8.04882 0.146522 7.85355C-0.04874 7.65829 -0.04874 7.34171 0.146522 7.14645L6.29297 1L3.00008 1C2.72393 1 2.50008 0.776142 2.50008 0.5C2.50008 0.223858 2.72393 -5.21078e-08 3.00008 1.1648e-07Z"
        fill="white"
      />
    </svg>
  )
}
