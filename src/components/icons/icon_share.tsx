interface IconProps {
  className?: string
}

export function IconShare({ className }: IconProps) {
  return (
    <svg width="50" height="50" className={className || ""} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.5007 47.9166C11.3548 47.9166 10.3739 47.5086 9.55794 46.6926C8.74197 45.8767 8.33398 44.8958 8.33398 43.7499V20.8333C8.33398 19.6874 8.74197 18.7065 9.55794 17.8905C10.3739 17.0746 11.3548 16.6666 12.5007 16.6666H18.7507V20.8333H12.5007V43.7499H37.5007V20.8333H31.2507V16.6666H37.5007C38.6465 16.6666 39.6274 17.0746 40.4434 17.8905C41.2593 18.7065 41.6673 19.6874 41.6673 20.8333V43.7499C41.6673 44.8958 41.2593 45.8767 40.4434 46.6926C39.6274 47.5086 38.6465 47.9166 37.5007 47.9166H12.5007ZM22.9173 33.3333V10.052L19.584 13.3853L16.6673 10.4166L25.0007 2.08325L33.334 10.4166L30.4173 13.3853L27.084 10.052V33.3333H22.9173Z"
        fill="url(#paint0_linear_2256_350)"
      />
      <defs>
        <linearGradient id="paint0_linear_2256_350" x1="8.3346" y1="2.08409" x2="51.9366" y2="33.7946" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0075FF" />
          <stop offset="1" stop-color="#00C2FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}
