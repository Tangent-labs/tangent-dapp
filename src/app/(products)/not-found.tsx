import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center gap-4">
        <Image height={140} width={140} src="/medias/tokens/USG.png" alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />

        <div className="flex flex-col items-center justify-center gap-4">
          <h2>This page does not exist</h2>

          <div className="rounded-[10px] bg-overlay-panel px-6 py-2 backdrop-blur-[60px] hover:bg-white/10">
            <Link className="text-lg font-semibold text-white" href="/">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
