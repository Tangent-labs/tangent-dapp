interface IconProps {
  className?: string
}

export function IconRsTan({ className = "" }: IconProps) {
  return (
    <svg width="60" height="60" className={className || ""} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="30" fill="url(#paint0_radial_2452_226)" />
      <g clipPath="url(#clip0_2452_226)">
        <path
          d="M30.0267 3.29883V29.9988H14.5199C15.241 29.9478 15.943 29.8712 16.6258 29.769C22.4201 28.8946 26.8424 25.9584 28.8461 16.7605C29.6119 13.2627 30.0203 8.85202 30.0267 3.30521V3.29883Z"
          fill="black"
        />
        <path
          d="M30.0599 56.6992L30.0599 29.9992L45.5667 29.9992C44.8456 30.0503 44.1437 30.1269 43.4609 30.229C37.6665 31.1035 33.2442 34.0396 31.2405 43.2375C30.4747 46.7354 30.0663 51.146 30.0599 56.6928L30.0599 56.6992Z"
          fill="black"
        />
      </g>
      <defs>
        <radialGradient
          id="paint0_radial_2452_226"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(30 30) rotate(90) scale(30)"
        >
          <stop stopColor="#ABD9E4" />
          <stop offset="0.474191" stopColor="#40A5C7" />
          <stop offset="1" stopColor="#102745" />
        </radialGradient>
        <clipPath id="clip0_2452_226">
          <rect width="31.02" height="53.4" fill="white" transform="translate(14.5199 3.29883)" />
        </clipPath>
      </defs>
    </svg>
  )
}
