import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Coins,
  Gift,
  HandCoins,
  ListChecks,
  LucideIcon,
  PiggyBank,
  Rocket,
  Sprout,
  Users,
  Vote,
  Wheat,
} from "lucide-react"
import { isOnMarket } from "@/components/products/product_nav/menu_bar_feature_controller"

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  external?: boolean
  /** active-state rule, same as the live menu (markets own every /[id]/<action> route) */
  isActive?: (path: string) => boolean
}

export type NavGroup = { group: string | null; items: NavItem[] }

/**
 * Same destinations as the live MenuBarFeature, grouped by intent like the Aave Pro sidebar:
 * the products first, then your rewards, then the protocol itself, then the airdrop. Swap keeps the live default pair.
 */
export const NAV: NavGroup[] = [
  {
    group: "Explore",
    items: [
      { href: "/", label: "Markets", icon: BarChart3, isActive: isOnMarket },
      { href: "/stake", label: "Savings", icon: PiggyBank, isActive: (p) => p.startsWith("/stake") },
      { href: "/earn", label: "Yields", icon: Sprout },
      {
        href: "/swap?tokenIn=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&tokenOut=0xb1c2db5d6ca03fce73dbd304d320bf76c55ae1b1",
        label: "Swap",
        icon: ArrowLeftRight,
        isActive: (p) => p === "/swap",
      },
    ],
  },
  {
    group: "Rewards",
    items: [
      { href: "/claim", label: "Claim", icon: HandCoins },
      { href: "/harvest", label: "Harvest", icon: Wheat },
    ],
  },
  {
    group: "Protocol",
    items: [
      { href: "/dashboard", label: "Insights", icon: Activity },
      { href: "/tan/lock", label: "TAN", icon: Coins, isActive: (p) => p.startsWith("/tan") },
      { href: "https://snapshot.box/#/s:tangent-finance.eth", label: "Governance", icon: Vote, external: true },
      { href: "https://docs.tangent.finance/docs/overview", label: "Docs", icon: BookOpen, external: true },
    ],
  },
  {
    group: "Airdrop",
    items: [
      { href: "/claim-airdrop", label: "Checker", icon: Gift },
      { href: "/tasks", label: "Tasks", icon: ListChecks },
      { href: "/referral", label: "Referral", icon: Users },
      { href: "/boosts", label: "Boosts", icon: Rocket },
    ],
  },
]

/** Footer links of the live app, shown as a small row at the bottom of the sidebar. */
export const SOCIALS = [
  { href: "https://x.com/Tangent_fi", label: "X" },
  { href: "https://t.me/+1xgNz42fNU01NGE0", label: "Telegram" },
  { href: "https://discord.gg/tangentfinance", label: "Discord" },
]

export const isItemActive = (item: NavItem, path: string) => !item.external && (item.isActive ? item.isActive(path) : path === item.href)
