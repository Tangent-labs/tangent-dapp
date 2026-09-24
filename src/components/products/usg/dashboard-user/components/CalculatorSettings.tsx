"use client"

import type { ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/design_system/inputs/button"
import { SliderInput } from "@/components/design_system/inputs/SliderInput"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CALCULATOR_INPUT_CLASSNAME, CalculatorLabel, CalculatorNumberField } from "./CalculatorField"
import type { CalculatorInputs, CalculatorMode } from "../dashboard_user_calculator"

type CalculatorSettingsProps = {
  inputs: CalculatorInputs
  onChange: (patch: Partial<CalculatorInputs>) => void
  onChangeMode: (mode: CalculatorMode) => void
  onSave: () => void
}

const MODE_OPTIONS: { value: CalculatorMode; label: string }[] = [
  { value: "existing", label: "Use existing position" },
  { value: "custom", label: "Simulate a custom position" },
]

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

// Spacing of the panel: 10px around and between the blocks (like the design).
// Every block takes its 10px on its own top (`pt-2.5`) instead of a `gap` on the parent, so a block that appears or
// disappears with the mode leaves no extra space behind. The last block (the button) sticks to the bottom.
const BLOCK = "pt-2.5"

type AnimatedBlockProps = {
  children: ReactNode
}

// Blocks shown only in some modes: they open and close smoothly instead of making the panel jump
const AnimatedBlock = ({ children }: AnimatedBlockProps) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
    className="overflow-hidden"
  >
    <div className={`flex flex-col gap-2.5 ${BLOCK}`}>{children}</div>
  </motion.div>
)

export const CalculatorSettings = ({ inputs, onChange, onChangeMode, onSave }: CalculatorSettingsProps) => (
  <div className="flex w-full shrink-0 flex-col rounded-[10px] bg-overlay-panel p-2.5 xl:w-[247px]">
    <span className="text-lg font-semibold text-white">Settings</span>

    <div className={BLOCK}>
      <Select value={inputs.mode} onValueChange={(value) => onChangeMode(value as CalculatorMode)}>
        <SelectTrigger className="min-h-[30px] text-xs font-semibold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="cursor-pointer text-xs font-semibold">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className={`box-content flex h-[30px] w-full items-center justify-between gap-1 ${BLOCK}`}>
      <CalculatorLabel label="Leverage" info="Simulate a leveraged position where borrowed USG is used to buy additional collateral." />
      <Switch checked={inputs.isLeveraged} onCheckedChange={(isLeveraged) => onChange({ isLeveraged })} />
    </div>

    <AnimatePresence initial={false}>
      {inputs.isLeveraged ? (
        <AnimatedBlock key="leveraged">
          <CalculatorNumberField
            label="Initial collateral"
            info="The value of the collateral you deposited first, without leverage."
            value={inputs.initialCollateralUsd}
            onChange={(initialCollateralUsd) => onChange({ initialCollateralUsd })}
          />
          <CalculatorNumberField
            label="Total collateral"
            info="Total collateral farming."
            value={inputs.totalCollateralUsd}
            onChange={(totalCollateralUsd) => onChange({ totalCollateralUsd })}
          />
        </AnimatedBlock>
      ) : (
        inputs.mode === "custom" && (
          <AnimatedBlock key="custom">
            <CalculatorNumberField
              label="Collateral"
              info="The USD value of collateral deposited in this position."
              value={inputs.collateralUsd}
              onChange={(collateralUsd) => onChange({ collateralUsd })}
            />
            <CalculatorNumberField
              label="Debt"
              info="The amount of USG borrowed against the collateral."
              value={inputs.debtUsd}
              onChange={(debtUsd) => onChange({ debtUsd })}
            />
          </AnimatedBlock>
        )
      )}
    </AnimatePresence>

    <div className={BLOCK}>
      <CalculatorNumberField
        label="Debt farming"
        info="Share of the total debt currently yielding."
        value={inputs.debtFarming}
        onChange={(debtFarming) => onChange({ debtFarming })}
      />
    </div>

    <div className={`flex w-full flex-col gap-2.5 ${BLOCK}`}>
      <CalculatorLabel label="Debt farming vAPR" info="The vAPR earned on the debt-farming amount above." />

      <div className="flex w-full items-start gap-2">
        <input
          placeholder="0"
          type="number"
          min={0}
          max={100}
          step={1}
          className={`${CALCULATOR_INPUT_CLASSNAME} w-14 shrink-0`}
          value={inputs.debtVAPR || ""}
          onChange={(e) => onChange({ debtVAPR: clampPercent(Number(e.target.value)) })}
        />

        {/* The bar of the slider is centered on the input (the legend hangs below it) */}
        <div className="flex w-full flex-col items-center justify-center pt-[13px]">
          <SliderInput
            disabled={false}
            value={inputs.debtVAPR}
            handleSliderChange={(e) => onChange({ debtVAPR: clampPercent(Number(e.target.value)) })}
            legendValues={["0", "25", "50", "75", "100"]}
            startEndRange={["0", "100", "1"]}
            unit="%"
          />
        </div>
      </div>
    </div>

    <div className={`mt-auto ${BLOCK}`}>
      <Button onClick={onSave}>Save and compute</Button>
    </div>
  </div>
)
