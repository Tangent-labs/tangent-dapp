interface IconProps {
  className?: string
}

export function IconBoosts({ className }: IconProps) {
  return (
    <svg className={className || ""} width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.3337 1L9.46191 5.94792C9.37442 6.03678 9.33018 6.08131 9.29102 6.11636C8.65821 6.68276 7.70133 6.68277 7.06852 6.11637C7.02935 6.08131 6.98478 6.03682 6.89723 5.94791C6.80969 5.859 6.7659 5.81452 6.72673 5.77946C6.09392 5.21306 5.13664 5.21306 4.50384 5.77946C4.46476 5.81444 4.4211 5.85878 4.33398 5.94726L1 9.33333M14.3337 1L14.3333 6M14.3337 1H9.33333"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
