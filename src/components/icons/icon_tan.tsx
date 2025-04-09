interface IconProps {
  className?: string
}

export function IconTan({ className }: IconProps) {
  return (
    <svg width="20" height="20" className={className || ""} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="black" />
      <g clipPath="url(#clip0_1995_1313)">
        <path
          d="M10.0089 1.09961V9.99961H4.83997C5.08033 9.98259 5.31432 9.95706 5.54192 9.92301C7.47336 9.63152 8.94746 8.6528 9.61538 5.58684C9.87064 4.42089 10.0068 2.95067 10.0089 1.10174V1.09961Z"
          fill="url(#paint0_linear_1995_1313)"
        />
        <path
          d="M10.0199 18.8994L10.0199 9.99941L15.1888 9.99941C14.9485 10.0164 14.7145 10.042 14.4869 10.076C12.5555 10.3675 11.0813 11.3462 10.4134 14.4122C10.1582 15.5781 10.022 17.0484 10.0199 18.8973L10.0199 18.8994Z"
          fill="url(#paint1_linear_1995_1313)"
        />
      </g>
      <defs>
        <linearGradient id="paint0_linear_1995_1313" x1="7.42443" y1="5.13961" x2="7.42443" y2="9.99961" gradientUnits="userSpaceOnUse">
          <stop stopColor="#102745" />
          <stop offset="0.525809" stopColor="#40A5C7" />
          <stop offset="1" stopColor="#ABD9E4" />
        </linearGradient>
        <linearGradient id="paint1_linear_1995_1313" x1="12.6044" y1="14.8594" x2="12.6044" y2="9.99941" gradientUnits="userSpaceOnUse">
          <stop stopColor="#102745" />
          <stop offset="0.525809" stopColor="#40A5C7" />
          <stop offset="1" stopColor="#ABD9E4" />
        </linearGradient>
        <clipPath id="clip0_1995_1313">
          <rect width="10.34" height="17.8" fill="white" transform="translate(4.83997 1.09961)" />
        </clipPath>
      </defs>
    </svg>
  )
}
