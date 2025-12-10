import ButtonTab from "./button_tab"
import BorderPanel from "../structure/border_panel"
import { IconGearWheel } from "@/components/icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type SlippageInputProps = {
  slippage: number
  setSlippage: (n: number) => void
}

export const SlippageInput = ({ slippage, setSlippage }: SlippageInputProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <BorderPanel className="flex h-[30px] cursor-pointer items-center justify-between bg-button-gradient py-2 font-gilroy">
          <span className="w-9 px-2 text-xs text-subtitle"> {slippage}%</span>
          <button type="button" title="Slippage">
            <div className="h-[30px] cursor-pointer rounded-[10px] border-l border-white/30 bg-button-gradient p-2 hover:bg-white/20">
              <IconGearWheel className="h-auto w-[12px] text-row-tonic" />
            </div>
          </button>
        </BorderPanel>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="center" sideOffset={8} collisionPadding={16} className="!m-0 !w-56 border-none font-gilroy">
        <div className="rounded-[10px] border-none bg-white bg-opacity-[3%] p-3 backdrop-blur-[60px]">
          <div className="flex w-full flex-col items-center justify-between gap-2">
            <div className="flex w-full items-center justify-start">Slippage</div>
            <input
              onChange={(e) => setSlippage(Number(e?.target?.value))}
              value={slippage}
              placeholder="0.5"
              type="number"
              min={0.1}
              step={0.1}
              className="w-full rounded-[10px] border border-white/30 bg-transparent pl-2 focus:outline-none"
            />
            <div className="mt-2 flex w-full items-center justify-between gap-2">
              <ButtonTab onClick={() => setSlippage(0.5)} label={"0.5%"} active={slippage === 0.5} className="rounded-full !px-2 !py-1" />
              <ButtonTab onClick={() => setSlippage(1)} label={"1.0%"} active={slippage === 1} className="rounded-full !px-2 !py-1" />
              <ButtonTab onClick={() => setSlippage(2)} label={"2.0%"} active={slippage === 2} className="rounded-full !px-2 !py-1" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
