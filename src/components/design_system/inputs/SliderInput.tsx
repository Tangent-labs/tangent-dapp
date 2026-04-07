"use client"

import { useState } from "react"

type SliderInputProps = {
  handleSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  value: number
  legendValues: string[]
  disabled?: boolean
  className?: string
  startEndRange: [string, string, string]
  unit: "%" | "x"
}

export const SliderInput = ({ className, handleSliderChange, legendValues, value, disabled, startEndRange, unit }: SliderInputProps) => {
  const [isBarHovered, setIsBarHovered] = useState(false)
  const start = Number(startEndRange[0])
  const end = Number(startEndRange[1])

  const percentage = ((value - start) * 100) / (end - start)
  return (
    <>
      <style jsx>{`
        @keyframes neon-slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }

        .neon-slide {
          animation: neon-slide 2s ease infinite;
        }

        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 6px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider-input.hovered::-webkit-slider-thumb {
          width: 22px;
          height: 9px;
        }

        .slider-input::-moz-range-thumb {
          width: 16px;
          height: 6px;
          border-radius: 2px 10px 10px 2px;
          background: #ffffff;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .slider-input.hovered::-moz-range-thumb {
          width: 22px;
          height: 9px;
        }
      `}</style>

      {/* SLIDER */}
      <div
        className="stop-focus no-parent-hover relative mt-1 h-1.5 w-full overflow-visible rounded-[10px] bg-[#4b5563]"
        onMouseEnter={() => setIsBarHovered(true)}
        onMouseLeave={() => setIsBarHovered(false)}
      >
        {/* Partie colorée avec effet neon */}
        <div
          className="absolute left-0 top-0 h-full overflow-hidden rounded-[10px]"
          style={{
            width: `${percentage}%`,
            filter: isBarHovered ? "brightness(1.15)" : "brightness(1)",
          }}
        >
          <div className="absolute inset-0 rounded-[10px] bg-[--tgt-button-active]" />
          <div
            className="neon-slide absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 40% 100% at 50% 50%, #0077ff 0%, rgba(0, 119, 255, 0.5) 40%, #2e8fffb8 0%`,
            }}
          />
        </div>
        {/* Legend dots — inside the slider container */}
        <div className="absolute inset-y-0 left-1 right-1.5">
          {legendValues?.map((el) => {
            const pos = ((Number(el) - start) * 100) / (end - start)
            return (
              <div
                key={`dot-${el}`}
                className="no-parent-hover absolute top-1/2 z-[5] h-1 w-1 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white"
                style={{ left: `${pos}%` }}
                onClick={() => handleSliderChange({ target: { value: el.toString() } } as React.ChangeEvent<HTMLInputElement>)}
              />
            )
          })}
        </div>

        {/* Invisible input slider */}
        <input
          type="range"
          min={start}
          max={end}
          step={startEndRange[2]}
          disabled={disabled}
          value={value}
          onChange={handleSliderChange}
          className={`slider-input absolute inset-x-0 top-1/2 z-10 h-4 w-full -translate-y-1/2 cursor-pointer appearance-none rounded-[10px] bg-transparent ${isBarHovered ? "hovered" : ""} ${className}`}
          style={{ background: "transparent" }}
        />
      </div>

      {/* LEGEND — labels only */}
      <div className="pointer-events-none relative h-2 w-full select-none text-[10px] text-subtitle">
        <div className="absolute inset-y-0 left-1 right-2">
          {legendValues.map((el) => {
            const pos = ((Number(el) - start) * 100) / (end - start)
            return (
              <div key={`label-${el}`} className="absolute" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
                <span className="whitespace-nowrap transition-colors duration-200" style={{ color: isBarHovered ? "#ffffff" : undefined }}>
                  {`${el} ${unit}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
