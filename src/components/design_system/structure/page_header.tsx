import { ReactNode } from "react"

type PageHeaderProps = {
  children: ReactNode
}

export function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="relative hidden h-[150px] w-1/2 overflow-hidden rounded-lg xl:flex">
      <div
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          border: "1px solid",
          background: "linear-gradient(0deg, rgba(255, 255, 255, 0) 68.33%, rgba(255, 255, 255, 0.1) 100%) border-box",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          borderImageSource: "radial-gradient(50% 50% at 0% 50%, #0075FF 0%, rgba(0, 0, 0, 0) 100%)",
        }}
      />

      <div className="flex w-full rounded-lg bg-panel-title-gradient">{children}</div>
    </div>
  )
}
