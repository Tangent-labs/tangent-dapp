export interface FeatureBanner {
  slot: number
  text: string
  link: string
  imageUrl: string
}

interface FeatureBannerResponse {
  slot: number
  text: string
  link: string
  imageUrl: string
  updatedAt: string
}

let pending: Promise<FeatureBanner[]> | null = null

let settled: FeatureBanner[] | null = null

export const getSettledFeatureBanners = (): FeatureBanner[] | null => settled

export const fetchFeatureBanners = async (): Promise<FeatureBanner[]> => {
  if (!pending) {
    pending = loadFeatureBanners()
      .then((banners) => {
        settled = banners
        return banners
      })
      .catch(() => {
        // Let a later mount retry rather than caching the failure for the session.
        pending = null
        // A failed load still counts as settled: a remount should show the fallback
        // card while it retries, rather than dropping back to a loading skeleton.
        settled = []
        return []
      })
  }

  return pending
}

export const loadFeatureBanners = async (): Promise<FeatureBanner[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100"
  const response = await fetch(`${baseUrl}/feature-banners`)

  if (!response.ok) throw new Error(`Feature banners request failed with ${response.status}`)

  const banners: FeatureBannerResponse[] = await response.json()

  return banners
    .sort((a, b) => a.slot - b.slot)
    .map((banner) => ({
      slot: banner.slot,
      text: banner.text,
      link: banner.link,
      // The API hands out a version-stamped path, relative to its own origin.
      imageUrl: `${baseUrl}${banner.imageUrl}`,
    }))
}
