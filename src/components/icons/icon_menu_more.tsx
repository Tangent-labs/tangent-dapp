interface IconProps {
  className?: string
}

export function IconMenuMore({ className }: IconProps) {
  return (
    <svg className={className || ""} width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5 25C19.4036 25 25 19.4036 25 12.5C25 5.59644 19.4036 0 12.5 0C5.59644 0 0 5.59644 0 12.5C0 19.4036 5.59644 25 12.5 25ZM6.25 7.5V10H18.75V7.5H6.25ZM6.25 15V17.5H18.75V15H6.25ZM18.75 13.75H6.25V11.25H18.75V13.75Z"
        fill="white"
      />
    </svg>
  )
}
