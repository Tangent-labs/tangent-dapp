import { TokenImage } from "../structure/token_image"

type MobileProtocolProps = {
  token: string
  label: string
}

export const MobileProtocol = ({ token, label }: MobileProtocolProps) => {
  return (
    <div className="hidden items-center justify-center gap-1 rounded-full bg-overlay-panel px-3 py-0.5 text-xs md:flex">
      <TokenImage token={token} size={12} />
      <span>{label}</span>
    </div>
  )
}
