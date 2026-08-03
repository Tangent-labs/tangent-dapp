import type { Metadata } from "next"

export const siteUrl = "https://app.tangent.finance"

const ogImage = { url: "/tangent-og.webp", width: 1200, height: 630, alt: "Tangent Finance" }

export function socialMetadata(title: string, description: string): Metadata {
  return {
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: "Tangent Finance",
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  }
}
