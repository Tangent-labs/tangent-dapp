interface IconProps {
  className?: string
}

export function IconTangentLogo({ className }: IconProps) {
  return (
    <svg className={className || ""} width="24" height="40" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.2444 20.0023C22.704 20.0406 22.178 20.098 21.6664 20.1745C17.3245 20.8296 14.0106 23.0292 12.5092 29.9199C11.9353 32.5403 11.6293 35.8446 11.6245 40V19.9976H23.2444V20.0023Z"
        fill="white"
      />
      <path
        d="M11.6199 0V20.0024H0C0.540347 19.9642 1.06635 19.9068 1.57801 19.8303C5.91991 19.1752 9.23372 16.9755 10.7352 10.0849C11.309 7.46444 11.6151 4.1602 11.6199 0.00478183V0Z"
        fill="white"
      />
    </svg>
  )
}
