interface IconProps {
  className?: string
  onClickIcon?: () => void
}

export function IconCopyPaste({ className, onClickIcon }: IconProps) {
  return (
    <svg onClick={onClickIcon} width="13" height="15" className={className || ""} viewBox="0 0 13 15" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 12C4.0875 12 3.73438 11.8531 3.44063 11.5594C3.14688 11.2656 3 10.9125 3 10.5V1.5C3 1.0875 3.14688 0.734375 3.44063 0.440625C3.73438 0.146875 4.0875 0 4.5 0H11.25C11.6625 0 12.0156 0.146875 12.3094 0.440625C12.6031 0.734375 12.75 1.0875 12.75 1.5V10.5C12.75 10.9125 12.6031 11.2656 12.3094 11.5594C12.0156 11.8531 11.6625 12 11.25 12H4.5ZM4.5 10.5H11.25V1.5H4.5V10.5ZM1.5 15C1.0875 15 0.734375 14.8531 0.440625 14.5594C0.146875 14.2656 0 13.9125 0 13.5V3H1.5V13.5H9.75V15H1.5Z" />
    </svg>
  )
}
