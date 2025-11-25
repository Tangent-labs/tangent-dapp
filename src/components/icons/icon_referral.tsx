interface IconProps {
  className?: string
}

export function IconReferral({ className }: IconProps) {
  return (
    <svg className={className || ""} width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 13.5C11 11.6591 8.76142 10.1667 6 10.1667C3.23858 10.1667 1 11.6591 1 13.5M14.3333 11V8.5M14.3333 8.5V6M14.3333 8.5H11.8333M14.3333 8.5H16.8333M6 7.66667C4.15905 7.66667 2.66667 6.17428 2.66667 4.33333C2.66667 2.49238 4.15905 1 6 1C7.84095 1 9.33333 2.49238 9.33333 4.33333C9.33333 6.17428 7.84095 7.66667 6 7.66667Z"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  )
}
