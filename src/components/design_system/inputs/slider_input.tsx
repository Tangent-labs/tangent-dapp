"use client"

type SliderInputProps = {
  handleSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const SliderInput = ({ handleSliderChange }: SliderInputProps) => {
  return (
    <div className="flex w-full items-center justify-between text-[10px] text-subtitle">
      <div className="relative flex w-fit items-center justify-center">
        0%
        <div
          onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "0" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
          className="absolute -top-1.5 left-1 mt-[1px] h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
        ></div>
      </div>
      {[25, 50, 75].map((el) => (
        <div key={el} className="relative flex w-fit items-center justify-center">
          {el}%
          <div
            onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: el.toString() } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
            className="absolute -top-1.5 left-2 mt-[1px] h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
          ></div>
        </div>
      ))}
      <div className="relative flex w-fit items-center justify-center">
        100%
        <div
          onClick={!!handleSliderChange ? () => handleSliderChange({ target: { value: "100" } } as React.ChangeEvent<HTMLInputElement>) : () => {}}
          className="absolute -top-1.5 right-1 mt-[1px] h-1 w-1 cursor-pointer rounded-full bg-white hover:bg-white/30"
        ></div>
      </div>
    </div>
  )
}
