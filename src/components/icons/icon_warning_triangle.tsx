"use client;"
interface IconProps {
  className?: string
}

export function IconWarningTriangle({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className || ""}>
      <title>warning-sign</title>
      <g stroke="currentcolor" fill="currentcolor">
        <path
          d="M1.243,18.953,10.152,2.111a2.093,2.093,0,0,1,3.7,0l8.909,16.842A2.079,2.079,0,0,1,20.908,22H3.092A2.079,2.079,0,0,1,1.243,18.953Z"
          fill="none"
          stroke="currentcolor"
          strokeLinecap="square"
          stroke-miterlimit="10"
          stroke-width="2"
        ></path>
        <line x1="12" y1="8" x2="12" y2="14" fill="none" stroke="inherit" strokeLinecap="square" stroke-miterlimit="10" stroke-width="2"></line>
        <circle data-stroke="none" cx="12" cy="17.5" r="1.5" stroke="none"></circle>
      </g>
    </svg>
  )
}
