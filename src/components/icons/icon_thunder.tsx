interface IconProps {
  className?: string
}

export function IconThunder({ className }: IconProps) {
  return (
    <svg width="6" height="11" className={className || ""} viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 4.00001L0.5 11L1.5 6.00001L0 6L1 0H5L3 4.00001H5.5Z" fill="url(#paint0_linear_893_1076)" />
      <defs>
        <linearGradient id="paint0_linear_893_1076" x1="0.000100998" y1="0.000201997" x2="8.79978" y2="4.40004" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB800" />
          <stop offset="1" stopColor="#FFF500" />
        </linearGradient>
      </defs>
    </svg>
  )
}
