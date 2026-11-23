"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, ChevronLeft, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatMillions } from "@/lib/number_formatter"
import { useRootContext } from "@/components/products/root/root_context"
import { WalletConnexionContent } from "@/components/products/wallet/wallet_connexion_content"
import { NAV, SOCIALS, isItemActive } from "./nav"
import { PegCardV2, PegMiniV2 } from "./peg-card"

const KEY = "tangent:sidebar-collapsed"
const EXPANDED = 260
const COLLAPSED = 58

// saved collapse state without a hydration mismatch: the server renders expanded, the client store takes over after mount
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb)
  window.addEventListener("tangent:sidebar", cb)
  return () => {
    window.removeEventListener("storage", cb)
    window.removeEventListener("tangent:sidebar", cb)
  }
}
const readCollapsed = () => localStorage.getItem(KEY) === "1"

/**
 * V2 app shell: collapsible sidebar (desktop), drawer (mobile), sticky top bar with TVL and the live wallet control.
 * Replaces MenuBarFeature + Footer when UI_V2 is on; every destination and number comes from the live routes and RootContext.
 */
export function ShellV2({ children }: { children: ReactNode }) {
  const path = usePathname()
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false)
  const [drawer, setDrawer] = useState(false)
  const { protocolCurrentTVL } = useRootContext()

  const toggle = () => {
    localStorage.setItem(KEY, collapsed ? "0" : "1")
    window.dispatchEvent(new Event("tangent:sidebar"))
  }

  useEffect(() => setDrawer(false), [path])

  // "[" toggles the sidebar, like the prototype
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key === "[" && !["INPUT", "TEXTAREA"].includes(t.tagName) && !t.isContentEditable) toggle()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  return (
    <div className="v2-shell flex min-h-dvh font-sans text-ink">
      {/* desktop sidebar: the collapse handle sits on its border line, level with the logo */}
      <div className="sticky top-0 z-50 hidden h-dvh shrink-0 lg:block">
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? COLLAPSED : EXPANDED }}
          transition={{ type: "spring", visualDuration: 0.3, bounce: 0.08 }}
          className="flex h-full flex-col overflow-hidden border-r border-hairline bg-sidebar pb-3"
        >
          <div className="flex h-[72px] shrink-0 items-center px-5">
            <Link href="/" aria-label="Tangent home" className="relative flex items-center">
              <Image
                src="/medias/v2/tangent-logo-typo.svg"
                alt="Tangent"
                width={100}
                height={30}
                unoptimized
                priority
                className={cn("max-w-none transition-opacity duration-200", collapsed && "opacity-0")}
              />
              {/* the mark alone, drawn at the exact size and place of the mark inside the full logo */}
              <span className={cn("absolute left-0 top-0 transition-opacity duration-200", collapsed ? "opacity-100" : "opacity-0")}>
                <TangentMark width={17.6} height={30} />
              </span>
            </Link>
          </div>
          <Nav path={path} collapsed={collapsed} />
          <div className="px-2.5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={collapsed ? "mini" : "full"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {collapsed ? <PegMiniV2 /> : <PegCardV2 />}
              </motion.div>
            </AnimatePresence>
            {!collapsed && <Socials />}
          </div>
        </motion.aside>
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar  [" : "Collapse sidebar  ["}
          className="absolute right-0 top-[24px] z-50 grid h-6 w-6 translate-x-1/2 place-items-center rounded-full border border-hairline bg-sidebar text-white opacity-70 transition hover:bg-raised hover:opacity-100"
        >
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform duration-300", collapsed && "rotate-180")} strokeWidth={2} />
        </button>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", visualDuration: 0.3, bounce: 0.05 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-hairline bg-sidebar pb-4 lg:hidden"
            >
              <div className="flex h-16 shrink-0 items-center justify-between px-5">
                <Brand />
                <button
                  onClick={() => setDrawer(false)}
                  aria-label="Close menu"
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-2 hover:bg-white/[0.06]"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
              <Nav path={path} collapsed={false} />
              <div className="px-3">
                <PegCardV2 />
                <Socials />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 bg-page">
          {/* same width and side padding as <main>; the hairline stops at the content edges, like Aave Pro */}
          <div className="mx-auto w-full max-w-[1520px] px-4 md:px-6 lg:px-8">
            <div className="flex h-16 items-center gap-3 border-b border-hairline lg:h-[72px]">
              <button
                onClick={() => setDrawer(true)}
                aria-label="Open menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-ink-2 hover:bg-white/[0.06] lg:hidden"
              >
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <span className="lg:hidden">
                <Brand />
              </span>
              <div
                className={cn(
                  "ml-auto hidden h-10 items-center gap-3 rounded-[10px] border border-hairline bg-white/[0.03] px-4 text-[13px] sm:flex",
                  !protocolCurrentTVL?.total && "animate-pulse"
                )}
              >
                <span className="text-ink-3">TVL</span>
                <span className="font-semibold tabular-nums">{protocolCurrentTVL?.total ? `$${formatMillions(protocolCurrentTVL.total)}` : "-"}</span>
              </div>
              <WalletConnexionContent className="ml-auto max-w-none sm:ml-0" />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1520px] px-4 pb-20 pt-8 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

/** Tangent logo + wordmark, the brand asset from Figma (Tangent file, node 11371:9555), shown 25% above its 80x24 artboard. */
function Brand() {
  return (
    <Link href="/" className="flex items-center" aria-label="Tangent home">
      <Image src="/medias/v2/tangent-logo-typo.svg" alt="Tangent" width={100} height={30} unoptimized priority />
    </Link>
  )
}

/** The Tangent logo mark (two petals). */
function TangentMark({ width = 14, height = 24 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 47 80" aria-hidden>
      <path
        fill="white"
        d="M46.8381 39.9998C45.7493 40.0763 44.6894 40.191 43.6584 40.344C34.9094 41.6541 28.2319 46.0529 25.2064 59.8325C24.0501 65.0727 23.4335 71.6804 23.4238 79.9902V39.9902H46.8381V39.9998Z"
      />
      <path
        fill="white"
        d="M23.4143 0V40H0C1.08881 39.9235 2.14872 39.8087 3.17972 39.6557C11.9288 38.3457 18.6062 33.9469 21.6317 20.1673C22.788 14.9271 23.4047 8.31939 23.4143 0.00956251V0Z"
      />
    </svg>
  )
}

function Nav({ path, collapsed }: { path: string; collapsed: boolean }) {
  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5">
      {NAV.map((g) => (
        <div key={g.group ?? "main"} className="mb-3">
          {g.group && (
            <div className="relative h-[22px] px-2.5 pb-1.5" aria-hidden={collapsed || undefined}>
              <span
                className={cn("block whitespace-nowrap text-[11px] font-medium uppercase text-ink-3 transition-opacity duration-200", collapsed && "opacity-0")}
              >
                {g.group}
              </span>
              <span
                className={cn("absolute left-2.5 top-[7px] h-px w-[18px] bg-white/20 transition-opacity duration-200", collapsed ? "opacity-100" : "opacity-0")}
              />
            </div>
          )}
          {g.items.map((it) => {
            const active = isItemActive(it, path)
            const Icon = it.icon
            return (
              <Link
                key={it.label}
                href={it.href}
                target={it.external ? "_blank" : undefined}
                rel={it.external ? "noopener noreferrer" : undefined}
                aria-label={collapsed ? it.label : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex h-9 items-center gap-2 rounded-[8px] px-2.5 text-[14px] transition-colors",
                  active ? "font-medium text-white" : "text-[#bcbcbc] hover:bg-white/[0.04] hover:text-white"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="v2-nav-active"
                    className="absolute inset-0 rounded-[8px] bg-white/[0.07]"
                    transition={{ type: "spring", visualDuration: 0.35, bounce: 0.15 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative h-[18px] w-[18px] shrink-0 text-white transition-opacity",
                    active ? "opacity-100" : "opacity-75 group-hover:opacity-100"
                  )}
                  strokeWidth={1.75}
                />
                <span className={cn("relative whitespace-nowrap transition-opacity duration-200", collapsed && "opacity-0")}>{it.label}</span>
                {it.external && (
                  <ArrowUpRight
                    className={cn("relative ml-auto h-3.5 w-3.5 shrink-0 text-white transition-opacity duration-200", collapsed ? "opacity-0" : "opacity-40")}
                    strokeWidth={1.75}
                  />
                )}
                {collapsed && (
                  <span className="pointer-events-none fixed left-[66px] z-50 -translate-x-1 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs font-medium text-black opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                    {it.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

function Socials() {
  return (
    <div className="mt-3 flex items-center gap-3 px-1 text-xs text-ink-3">
      {SOCIALS.map((s) => (
        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
          {s.label}
        </a>
      ))}
    </div>
  )
}
