/**
 * UI switch. NEXT_PUBLIC_UI=v2 renders the V2 interface on top of the same contexts, controllers and services.
 * Every V2 branch only changes markup; once V2 ships, delete the V1 branches and this flag.
 */
export const UI_V2 = process.env.NEXT_PUBLIC_UI === "v2"

/**
 * Class helper for V1-only visuals that V2 hides but keeps for screen readers (form section titles).
 * Visually hidden but still in the flex flow, so the "Max ..." hint next to it stays right-aligned.
 */
export const v2Hidden = (v1ClassName: string) => (UI_V2 ? "h-px w-px shrink-0 overflow-hidden whitespace-nowrap [clip-path:inset(50%)]" : v1ClassName)
