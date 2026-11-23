"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, Menu, PanelLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatMillions } from "@/lib/number_formatter"
import { useRootContext } from "@/components/products/root/root_context"
import { WalletConnexionContent } from "@/components/products/wallet/wallet_connexion_content"
import { NAV, SOCIALS, isItemActive } from "./nav"
import { PegCardV2, PegMiniV2 } from "./peg-card"

const KEY = "tangent:sidebar-collapsed"
const EXPANDED = 248
const COLLAPSED = 72

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
    <div className="flex min-h-dvh font-sans text-ink">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? COLLAPSED : EXPANDED }}
        transition={{ type: "spring", visualDuration: 0.3, bounce: 0.08 }}
        className="sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-hairline bg-sidebar pb-3 lg:flex"
      >
        <div className={cn("flex h-[72px] shrink-0 items-center", collapsed ? "justify-center" : "justify-between px-6")}>
          {!collapsed && <Brand />}
          <button
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar  [" : "Collapse sidebar  ["}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <PanelLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <Nav path={path} collapsed={collapsed} />
        <div className="px-3">
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
        <header className="bg-page/85 sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-hairline px-4 backdrop-blur-md md:px-8 lg:h-[72px] lg:px-12">
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
        </header>
        <main className="mx-auto w-full max-w-[1264px] px-4 pb-20 pt-6 md:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  )
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em]" aria-label="Tangent home">
      <svg width="14" height="24" viewBox="0 0 47 80" aria-hidden>
        <path
          fill="white"
          d="M46.8381 39.9998C45.7493 40.0763 44.6894 40.191 43.6584 40.344C34.9094 41.6541 28.2319 46.0529 25.2064 59.8325C24.0501 65.0727 23.4335 71.6804 23.4238 79.9902V39.9902H46.8381V39.9998Z"
        />
        <path
          fill="white"
          d="M23.4143 0V40H0C1.08881 39.9235 2.14872 39.8087 3.17972 39.6557C11.9288 38.3457 18.6062 33.9469 21.6317 20.1673C22.788 14.9271 23.4047 8.31939 23.4143 0.00956251V0Z"
        />
      </svg>
      Tangent
    </Link>
  )
}

function Nav({ path, collapsed }: { path: string; collapsed: boolean }) {
  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3">
      {NAV.map((g) => (
        <div key={g.group ?? "main"} className="mb-4">
          {g.group &&
            (collapsed ? (
              <div className="mx-auto mb-2 mt-1 h-px w-6 bg-divider" />
            ) : (
              <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-3">{g.group}</div>
            ))}
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
                  "group relative flex h-10 items-center rounded-lg text-[14px] font-medium transition-colors",
                  collapsed ? "justify-center" : "gap-3 px-3",
                  active ? "text-white" : "text-ink-2 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="v2-nav-active"
                    className="absolute inset-0 rounded-lg bg-white/[0.07]"
                    transition={{ type: "spring", visualDuration: 0.35, bounce: 0.15 }}
                  />
                )}
                <Icon className="relative h-4 w-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && <span className="relative whitespace-nowrap">{it.label}</span>}
                {!collapsed && it.external && <ArrowUpRight className="relative ml-auto h-3.5 w-3.5 text-ink-3" strokeWidth={1.75} />}
                {collapsed && (
                  <span className="pointer-events-none fixed left-[80px] z-50 -translate-x-1 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs font-medium text-black opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
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
