interface IconProps {
  className?: string
}

export function IconVsTan({ className = "" }: IconProps) {
  return (
    <svg width="25" height="25" className={className || ""} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12.5" cy="12.5" r="12.5" fill="url(#paint0_radial_5542_2889)" />
      <g clipPath="url(#clip0_5542_2889)">
        <path
          d="M12.5112 1.375V12.5H6.05005C6.35051 12.4787 6.64299 12.4468 6.92749 12.4043C9.34179 12.0399 11.1844 10.8165 12.0193 6.98404C12.3384 5.5266 12.5086 3.68883 12.5112 1.37766V1.375Z"
          fill="black"
        />
        <path
          d="M12.5252 23.625L12.5252 12.5L18.9863 12.5C18.6859 12.5213 18.3934 12.5532 18.1089 12.5957C15.6946 12.9601 13.852 14.1835 13.0171 18.016C12.698 19.4734 12.5278 21.3112 12.5252 23.6223L12.5252 23.625Z"
          fill="black"
        />
      </g>
      <defs>
        <radialGradient
          id="paint0_radial_5542_2889"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(12.5 12.5) rotate(90) scale(12.5)"
        >
          <stop stopColor="#ABD9E4" />
          <stop offset="0.474191" stopColor="#40A5C7" />
          <stop offset="1" stopColor="#1D4578" />
        </radialGradient>
        <clipPath id="clip0_5542_2889">
          <rect width="12.925" height="22.25" fill="white" transform="translate(6.05005 1.375)" />
        </clipPath>
      </defs>
    </svg>
  )
}
