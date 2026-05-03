import { IconTangentLogo } from "@/components/icons"
import Link from "next/link"

export default function MaintenancePage() {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-dark px-6"
      style={{ backgroundImage: "url('/medias/background.svg')", backgroundSize: "40px 40px" }}
    >
      {/* Glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(0,117,255,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="flex w-full max-w-[500px] flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-1 text-lg">
          <IconTangentLogo></IconTangentLogo> Tangent
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
          </span>
          <span className="text-xs font-medium text-orange-400">Under Maintenance</span>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-semibold leading-tight text-white">We&apos;ll be back shortly.</h1>
          <p className="text-sm leading-relaxed text-subtitle">
            We&apos;re performing emergency maintenance on the interface. This should only take a few minutes — follow our socials for live updates.
          </p>
        </div>

        {/* Funds safe callout */}
        <div className="bg-success/5 flex w-full flex-col gap-2 rounded-[10px] border border-white/10 bg-overlay-panel px-5 py-4 text-left backdrop-blur-[60px]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-sm font-semibold text-success">Your funds are safe</span>
          </div>
          <p className="text-xs leading-relaxed text-subtitle">
            Only the interface is paused. All Tangent smart contracts remain fully operational — you can always interact with them directly on-chain.
          </p>
          <Link
            href="https://docs.tangent.finance/docs/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="text-success/80 mt-1 flex w-fit items-center gap-1 text-xs transition-colors hover:text-success"
          >
            View contracts on docs
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 8L8 2M8 2H3M8 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/10" />

        {/* Social links */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs text-subtitle">Follow for live updates</p>
          <div className="flex items-center gap-3">
            <Link
              href="https://x.com/Tangent_fi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-subtitle transition-colors hover:border-white/20 hover:text-white"
            >
              <svg width="12" height="11" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.061 0H13.2069L8.4952 5.09225L14 12H9.68014L6.2979 7.80225L2.42586 12H0.279907L5.27158 6.55351L0 0H4.42719L7.48284 3.83469L11.061 0ZM10.3099 10.8044H11.4995L3.80207 1.1513H2.52383L10.3099 10.8044Z"
                  fill="currentColor"
                />
              </svg>
              @Tangent_fi
            </Link>

            <Link
              href="https://discord.gg/tangentfinance"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-subtitle transition-colors hover:border-white/20 hover:text-white"
            >
              <svg width="13" height="11" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12.7064 1.005C11.7354 0.5355 10.6972 0.194289 9.61181 0C9.47851 0.249071 9.32277 0.584077 9.2154 0.850574C8.06156 0.671245 6.91834 0.671245 5.78572 0.850574C5.67837 0.584077 5.5191 0.249071 5.3846 0C4.298 0.194289 3.2586 0.536754 2.28762 1.00748C0.329152 4.06602 -0.201757 7.04858 0.0636979 9.98879C1.36266 10.9913 2.62151 11.6003 3.85911 11.9988C4.16468 11.5641 4.43721 11.1021 4.67199 10.6152C4.22484 10.4396 3.79658 10.2229 3.39192 9.97137C3.49927 9.88917 3.60429 9.80324 3.70574 9.71482C6.17387 10.9079 8.85556 10.9079 11.2942 9.71482C11.3969 9.80324 11.5018 9.88917 11.608 9.97137C11.2022 10.2242 10.7727 10.4408 10.3256 10.6165C10.5604 11.1021 10.8317 11.5654 11.1385 12C12.3773 11.6015 13.6373 10.9925 14.9362 9.98879C15.2477 6.58034 14.4042 3.62516 12.7064 1.005ZM5.00823 8.18059C4.26733 8.18059 3.65972 7.46576 3.65972 6.59528C3.65972 5.72479 4.25435 5.00873 5.00823 5.00873C5.76214 5.00873 6.36972 5.72354 6.35675 6.59528C6.35792 7.46576 5.76214 8.18059 5.00823 8.18059ZM9.99171 8.18059C9.2508 8.18059 8.6432 7.46576 8.6432 6.59528C8.6432 5.72479 9.23781 5.00873 9.99171 5.00873C10.7456 5.00873 11.3532 5.72354 11.3402 6.59528C11.3402 7.46576 10.7456 8.18059 9.99171 8.18059Z"
                  fill="currentColor"
                />
              </svg>
              Discord
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
