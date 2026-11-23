import { DM_Sans } from "next/font/google"
import localFont from "next/font/local"

export const gilroy = localFont({
  src: [
    {
      path: "../../public/fonts/Gilroy-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gilroy-LightItalic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/Gilroy-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gilroy-RegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Gilroy-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gilroy-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/Gilroy-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gilroy-SemiboldItalic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/Gilroy-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gilroy-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-gilroy",
  display: "swap",
})

/** V2 typeface (brand board): DM Sans, Light for hero numbers, Medium and SemiBold for UI */
export const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-dm-sans", display: "swap" })
