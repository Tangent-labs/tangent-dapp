import { APPEARANCE_KEY, DEFAULT_APPEARANCE, LIGHT_QUERY } from "./constants"

/**
 * Inline script for <head>: sets <html data-theme> from the saved appearance before the first paint, so a light user
 * never sees a dark flash. Kept tiny and dependency free on purpose.
 */
const code = `(function(){try{var a=localStorage.getItem("${APPEARANCE_KEY}")||"${DEFAULT_APPEARANCE}";var t=a==="system"?(matchMedia("${LIGHT_QUERY}").matches?"light":"dark"):a;document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
