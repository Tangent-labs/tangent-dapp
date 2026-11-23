"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"
import { UI_V2 } from "@/v2/ui"

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>>(
  ({ className, ...props }, ref) =>
    UI_V2 ? (
      <SwitchPrimitives.Root
        className={cn(
          "focus-visible:ring-action/50 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-action data-[state=unchecked]:bg-white/[0.12]",
          className
        )}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform duration-150 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
      </SwitchPrimitives.Root>
    ) : (
      <SwitchPrimitives.Root
        className={cn(
          "inline-flex h-5 w-[38px] cursor-pointer items-center rounded-full border border-white border-opacity-10 transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:rounded-full data-[state=checked]:border-subtitle data-[state=checked]:bg-button-active data-[state=unchecked]:bg-[#070707] data-[state=unchecked]:hover:bg-input",
          className
        )}
        style={{ borderWidth: 1.5 }}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block h-3 w-3 rounded-full bg-foreground shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5"
          )}
        />
      </SwitchPrimitives.Root>
    )
)
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
