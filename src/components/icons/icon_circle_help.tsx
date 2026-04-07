interface IconProps {
  className?: string
}

export function IconCircleHelp({ className = "" }: IconProps) {
  return (
    <svg className={className + " text-white/80 hover:text-white"} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.26158 14.14V8.092H10.7376V14.14H9.26158ZM9.21358 5.5H10.7976V7.144H9.21358V5.5Z" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z"
        fill="currentColor"
      />
    </svg>
  )
}
