import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn("group/navigation-menu relative hidden max-w-max md:flex", className)}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("group relative flex flex-1 list-none items-center justify-center gap-2 rounded-[10px]", className)}
      {...props}
    />
  )
}

function NavigationMenuDropdown({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn("relative text-sm aria-disabled:text-gray-500", className)} {...props} />
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn(
        "hover:white relative cursor-pointer rounded-[10px] text-sm font-semibold text-white transition-colors duration-200 aria-disabled:text-gray-500",
        className
      )}
      {...props}
    />
  )
}

function navigationMenuTriggerStyle(isSelected: boolean) {
  return cn(
    " group inline-flex text-[--tgt-subtitle] w-max items-center justify-center font-semibold rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-white/10 disabled:pointer-events-none outline-none transition-[color,box-shadow] ",
    "data-[state=open]:bg-white/10",
    isSelected ? "text-white" : ""
  )
}

type NavigationTriggerProps = { isSelected: boolean } & React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>
function NavigationMenuTrigger({ isSelected, className, children, ...props }: NavigationTriggerProps) {
  return (
    <div className="group/trigger relative pb-1">
      <NavigationMenuPrimitive.Trigger
        data-slot="navigation-menu-trigger"
        className={cn(navigationMenuTriggerStyle(isSelected), "group font-semibold", className)}
        {...props}
      >
        {children}
        <ChevronDownIcon
          className="relative top-[1px] ml-1 size-3 text-[--tgt-subtitle] transition duration-100 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </NavigationMenuPrimitive.Trigger>
      <span
        className={cn(
          "absolute bottom-0 left-0 z-20 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[--tgt-row-tonic] to-blue-600 transition-transform duration-300 ease-out group-hover/trigger:origin-left group-hover/trigger:scale-x-100",
          "",
          isSelected ? "origin-left scale-x-100" : "origin-left scale-x-0 group-hover/link:origin-left group-hover/link:scale-x-100"
        )}
      />
    </div>
  )
}

function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "left-0 top-0 w-full md:absolute md:w-auto",
        "**:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        "group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-[10px] group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out",
        "group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0",
        "group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-[0.98] group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-[0.98]",
        "group-data-[viewport=false]/navigation-menu:data-[state=closed]:slide-out-to-top-1 group-data-[viewport=false]/navigation-menu:data-[state=open]:slide-in-from-top-1",
        "group-data-[viewport=false]/navigation-menu:duration-100 group-data-[viewport=false]/navigation-menu:ease-out",
        className
      )}
      {...props}
    />
  )
}
function NavigationMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className={cn("absolute left-0 top-full isolate z-50 flex justify-center")}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-[10px] border-tangent",
          "border-white border-opacity-20 bg-overlay-panel shadow backdrop-blur-[60px]",
          "md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props}
      />
    </div>
  )
}
// Links in the Navbar popover
function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "cursor-pointer rounded-[10px] p-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 aria-disabled:text-gray-500",
        className
      )}
      {...props}
    />
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
  NavigationMenuDropdown,
}
