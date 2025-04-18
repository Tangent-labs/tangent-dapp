interface IconProps {
  className?: string
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg className={className || ""} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.84314 13.0339C10.8753 13.0339 13.3333 10.6311 13.3333 7.66701C13.3333 4.70295 10.8753 2.3001 7.84314 2.3001C4.81099 2.3001 2.35294 4.70295 2.35294 7.66701C2.35294 10.6311 4.81099 13.0339 7.84314 13.0339ZM7.84314 15.334C12.1748 15.334 15.6863 11.9014 15.6863 7.66701C15.6863 3.43264 12.1748 0 7.84314 0C3.51149 0 0 3.43264 0 7.66701C0 11.9014 3.51149 15.334 7.84314 15.334Z"
        fill="#9B9B9B"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.549 11.0899L19.6554 18.0367C20.1149 18.4859 20.1149 19.214 19.6554 19.6632C19.196 20.1123 18.4511 20.1123 17.9916 19.6632L10.8852 12.7163L12.549 11.0899Z"
        fill="#9B9B9B"
      />
    </svg>
  )
}
