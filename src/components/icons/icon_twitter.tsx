interface IconProps {
  className?: string
}

export function IconTwitter({ className }: IconProps) {
  return (
    <svg className={className || ""} width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.061 0H13.2069L8.4952 5.09225L14 12H9.68014L6.2979 7.80225L2.42586 12H0.279907L5.27158 6.55351L0 0H4.42719L7.48284 3.83469L11.061 0ZM10.3099 10.8044H11.4995L3.80207 1.1513H2.52383L10.3099 10.8044Z"
        fill="#9B9B9B"
      />
    </svg>
  )
}
