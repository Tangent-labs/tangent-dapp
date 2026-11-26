/**
 * Logo ring on the light theme, as Aave Pro draws it: a 1px hairline laid INSIDE the logo's edge (Aave uses an inset
 * box-shadow over a round-cropped logo). An SVG filter does the same along any shape, so LP pairs and non-round logos
 * get it too without being cropped: edge = alpha minus alpha eroded by 1px, tinted, drawn over the logo.
 * Used by css_globals.css (img[data-logo] on the light theme). Rendered once in the root layout.
 */
export const LOGO_RING_FILTER_ID = "tgt-logo-ring"

export function LogoRingDefs() {
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <defs>
        <filter id={LOGO_RING_FILTER_ID} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="erode" radius="1" result="inner" />
          <feComposite in="SourceAlpha" in2="inner" operator="out" result="edge" />
          <feFlood floodColor="#000000" floodOpacity="0.09" result="ink" />
          <feComposite in="ink" in2="edge" operator="in" result="ring" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="ring" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}
