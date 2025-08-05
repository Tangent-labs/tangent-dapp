interface IconProps {
  className?: string
  active?: boolean
}

export function IconMenuTan({ className, active = false }: IconProps) {
  return (
    <svg className={className || ""} width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active && (
        <defs>
          <linearGradient id="tanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0075FF" />
            <stop offset="100%" stopColor="#00C2FF" />
          </linearGradient>
        </defs>
      )}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5 0C5.5965 0 0 5.5965 0 12.5C0 19.4035 5.5965 25 12.5 25C19.4035 25 25 19.4035 25 12.5C25 5.5965 19.4035 0 12.5 0ZM19.4427 12.5013C19.1198 12.5241 18.8057 12.5586 18.5 12.6041C15.9056 12.9956 13.9257 14.3099 13.0285 18.427C12.6857 19.9927 12.5029 21.9671 12.5 24.4498V12.4984H5.55727C5.88023 12.4757 6.1943 12.4412 6.5 12.3957C9.0944 12.0042 11.0743 10.6899 11.9715 6.5727C12.3143 5.00706 12.4971 3.03269 12.5 0.549948V12.4984H19.4427V12.5013Z"
        fill={active ? "url(#tanGradient)" : "white"}
      />
    </svg>
  )
}
