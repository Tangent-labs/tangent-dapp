interface IconProps {
  className?: string
  active?: boolean
}

export default function IconDashboard({ className, active }: IconProps) {
  return (
    <svg className={className || ""} width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active && (
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0075ff" />
            <stop offset="100%" stopColor="#00c2ff" />
          </linearGradient>
        </defs>
      )}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25 12.5C25 19.4036 19.4036 25 12.5 25C5.59644 25 0 19.4036 0 12.5C0 5.59644 5.59644 0 12.5 0C19.4036 0 25 5.59644 25 12.5ZM15 11.25V17.5H13V11.25H15ZM11.25 17.5V8.75H9.25V17.5H11.25ZM7.5 12.5V17.5H5.5V12.5H7.5ZM16.75 17.5H18.75V7.5H16.75V17.5Z"
        fill={active ? "url(#iconGradient)" : "white"}
      />
    </svg>
  )
}
