interface IconProps {
  className?: string
  active?: boolean
}

export function IconMarket({ className, active = false }: IconProps) {
  return (
    <svg className={className || ""} width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      {active && (
        <defs>
          <linearGradient id="marketGradient" x1="0" y1="0" x2="25" y2="25" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0075FF" />
            <stop offset="1" stopColor="#00C2FF" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M16.622 14.2569C18.1712 13.5615 19.2501 12.0055 19.2501 10.1974C19.2501 7.74115 17.259 5.75 14.8028 5.75C12.9947 5.75 11.4387 6.82892 10.7433 8.37805C13.8687 8.64012 16.36 11.1315 16.622 14.2569Z"
        fill={active ? "url(#marketGradient)" : "white"}
      />
      <path
        d="M14.2568 16.6219C13.5614 18.1711 12.0054 19.25 10.1974 19.25C7.74115 19.25 5.75 17.2588 5.75 14.8026C5.75 12.9945 6.82898 11.4385 8.37818 10.7431C8.64015 13.8685 11.1315 16.3599 14.2568 16.6219Z"
        fill={active ? "url(#marketGradient)" : "white"}
      />
      <path
        d="M14.6419 14.6419C12.3135 14.5591 10.441 12.6865 10.3583 10.3581C12.6866 10.4409 14.5592 12.3135 14.6419 14.6419Z"
        fill={active ? "url(#marketGradient)" : "white"}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25 12.5C25 19.4036 19.4036 25 12.5 25C5.59644 25 0 19.4036 0 12.5C0 5.59644 5.59644 0 12.5 0C19.4036 0 25 5.59644 25 12.5ZM16.436 16.4361C15.7128 19.2059 13.1938 21.25 10.1974 21.25C6.63659 21.25 3.75 18.3634 3.75 14.8026C3.75 11.8061 5.7942 9.28706 8.56413 8.56392C9.28734 5.7941 11.8063 3.75 14.8028 3.75C18.3636 3.75 21.2501 6.63659 21.2501 10.1974C21.2501 13.1939 19.2059 15.7129 16.436 16.4361Z"
        fill={active ? "url(#marketGradient)" : "white"}
      />
    </svg>
  )
}
