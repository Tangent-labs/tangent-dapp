"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { ReliefCard } from "./relief_card"
import { PointsCampaignLiveCard } from "./points_campaign_live_card"
import { FeatureBanner, fetchFeatureBanners } from "./feature_banners"

const SLIDE_INTERVAL_MS = 5500
const SLIDE_DURATION_MS = 700
/** Overshoot-free ease that settles the slide rather than stopping it dead. */
const SLIDE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)"
/** How far the artwork's left edge fades into the card. */
const IMAGE_FADE_PX = 80
/** Artwork height as a multiple of the card's, so it bleeds past the top and bottom edges. */
const IMAGE_ZOOM = 1.4

interface FeatureBannerCarouselProps {
  className?: string
}

export function FeatureBannerCarousel({ className }: FeatureBannerCarouselProps) {
  const [banners, setBanners] = useState<FeatureBanner[]>([])

  // `index` runs one past the last banner onto a clone of the first, so the wrap
  // keeps travelling upwards instead of rewinding through every slide.

  const [index, setIndex] = useState(0)

  const [isAnimated, setIsAnimated] = useState(true)

  const [isPaused, setIsPaused] = useState(false)

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchFeatureBanners().then((result) => {
      if (!cancelled) setBanners(result)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(query.matches)

    const onChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)
    query.addEventListener("change", onChange)

    return () => query.removeEventListener("change", onChange)
  }, [])

  const count = banners.length

  useEffect(() => {
    if (count <= 1 || isPaused || prefersReducedMotion) return

    const interval = setInterval(() => {
      setIsAnimated(true)
      setIndex((current) => current + 1)
    }, SLIDE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [count, isPaused, prefersReducedMotion])

  if (count === 0) return <PointsCampaignLiveCard className={className} />

  const activeIndex = index % count
  const slides = count > 1 ? [...banners, banners[0]] : banners

  const goTo = (target: number) => {
    // Also stops a click on the active dot from rewinding the whole strip when
    // the wrap-around clone is mid-flight.
    if (target === activeIndex) return

    setIsAnimated(true)
    setIndex(target)
  }

  // Landing on the clone means we are visually back at the first banner, so cut
  // the transition and reset the offset before the next tick moves us again.
  const onTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    // Transitions inside a slide (the artwork's hover zoom) bubble up here too.
    if (event.target !== event.currentTarget) return

    if (index === count) {
      setIsAnimated(false)
      setIndex(0)
    }
  }

  return (
    <ReliefCard className={cn("w-full", className)}>
      <div className="relative h-16 w-full overflow-hidden rounded-[10px]" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        {count > 1 && (
          <div className="absolute left-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-[5px]">
            {banners.map((banner, slideIndex) => (
              <button
                key={banner.slot}
                type="button"
                aria-label={banner.text}
                aria-current={activeIndex === slideIndex}
                onClick={() => goTo(slideIndex)}
                className={cn(
                  "w-[5px] rounded-full transition-all duration-300",
                  activeIndex === slideIndex ? "h-3.5 bg-white" : "h-[5px] bg-white/30 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        )}

        <div
          className="h-full transition-transform"
          style={{
            transform: `translateY(-${index * 100}%)`,
            transitionDuration: isAnimated && !prefersReducedMotion ? `${SLIDE_DURATION_MS}ms` : "0ms",
            transitionTimingFunction: SLIDE_EASING,
          }}
          onTransitionEnd={onTransitionEnd}
        >
          {slides.map((banner, slideIndex) => (
            <a
              key={`${banner.slot}-${slideIndex}`}
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("group relative flex h-16 w-full items-center justify-start", count > 1 ? "pl-14" : "pl-6")}
            >
              <span style={{ fontSize: "20px", lineHeight: "20px" }} className="min-w-0 truncate !font-semibold italic">
                {banner.text}
              </span>
              <div className="ml-6 flex shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] bg-tonic px-6 py-0.5 font-semibold not-italic text-black">
                Live
              </div>

              {/* Takes whatever room is left after the badge, so the artwork centres in it. */}
              <div
                className="ml-4 h-full min-w-[35%] flex-1 bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-[1.03]"
                style={{
                  backgroundImage: `url(${banner.imageUrl})`,
                  // Taller than the card so the artwork is cropped by the top and bottom edges
                  // rather than sitting inside them, and still keeps its aspect ratio.
                  backgroundSize: `auto ${IMAGE_ZOOM * 100}%`,
                  // Fades the artwork into the card instead of butting it against the text.
                  // Fixed width so the fade reads the same whatever the image's size.
                  maskImage: `linear-gradient(to right, transparent, #000 ${IMAGE_FADE_PX}px)`,
                  WebkitMaskImage: `linear-gradient(to right, transparent, #000 ${IMAGE_FADE_PX}px)`,
                }}
              />
            </a>
          ))}
        </div>
      </div>
    </ReliefCard>
  )
}
