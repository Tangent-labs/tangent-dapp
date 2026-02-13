"use client"

import { ReactNode } from "react"

type SliderInputProps = {
  handleSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  percentage: number
  legendValues?: string[]
  disabled?: boolean
  className?: string
}

export const SliderInput = ({ className, handleSliderChange, legendValues, percentage, disabled }: SliderInputProps) => {
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
          animation: neon-slide 3s ease infinite;
        }

        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 6px;
          border-radius: "2px 10px 10px 2px";
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider-input::-webkit-slider-thumb:hover {
          width: 22px;
          height: 9px;
          background: #ffffff;
        }

        .slider-input::-moz-range-thumb {
          width: 16px;
          height: 6px;
          border-radius: "2px 10px 10px 2px";
          background: #ffffff;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .slider-input::-moz-range-thumb:hover {
          width: 22px;
          height: 9px;
          background: #ffffff;
        }
      `}</style>

      {/* SLIDER */}

      <div className="no-parent-hover relative mt-3 h-1.5 w-full overflow-visible rounded-[10px] bg-[#4b5563]">
        {/* Partie colorée avec effet neon */}
        <div
          className="absolute left-0 top-0 h-full overflow-hidden rounded-[10px]"
          style={{
            width: `${percentage}%`,
          }}
        >
          {/* Background de base */}
          <div
            className="absolute inset-0 rounded-[10px]"
            style={{
              background: `linear-gradient(0deg, rgba(59, 130, 246, 0.4), rgba(59, 130, 246, 0.4))`,
            }}
          />

          {/* Ellipse animée qui se déplace */}
          <div
            className="neon-slide absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 40% 100% at 50% 50%, #0077ff 0%, rgba(0, 119, 255, 0.5) 40%, rgba(0, 0, 0, 0) 100%)`,
            }}
          />

          {/* Bordure néon avec gradient radial de gauche à droite */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[10px]"
            style={{
              padding: "2px",
              background: `
            radial-gradient(100% 50% at 0% 50%, #FFFFFF 0%, #0075FF 19.71%, rgba(0, 0, 0, 0) 100%), 
            linear-gradient(0deg, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0.2) 100%)`,
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
        </div>

        {/* Input slider invisible mais fonctionnel */}
        <input
          type="range"
          min="0"
          step="1"
          max="100"
          disabled={disabled}
          value={percentage}
          onChange={handleSliderChange}
          className={"slider-input absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[10px] bg-transparent " + className}
          style={{
            background: "transparent",
          }}
        />
      </div>
      {/* LEGEND */}
      {legendValues && (
        <div className="flex w-full items-center justify-between text-[10px] text-subtitle">
          {legendValues.map((el) => (
            <div key={el} className="relative flex w-fit items-center justify-center">
              <span>{el}%</span>
              <div
                onClick={
                  !!handleSliderChange ? () => handleSliderChange({ target: { value: el.toString() } } as React.ChangeEvent<HTMLInputElement>) : () => {}
                }
                className="absolute -top-1.5 mt-[1px] h-1 w-1 cursor-pointer rounded-full bg-white"
              ></div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
