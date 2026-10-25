"use client"

import { ListRowDisposition } from "@/components/design_system/list/list_row_disposition"
import Link from "next/link"
import { ListGradientBorder } from "./list_gradient_border"

interface ListRowProps {
  children: React.ReactNode[]
  className?: string
  route: string
  rowDisposition?: React.ComponentType<{ children: React.ReactNode[] }>
  isSelected?: boolean
  openInNewTab?: boolean
  // Rows that expand in place instead of navigating : when set, the click runs this and `route` is unused
  navigate?: () => void
}

export const ListRow = ({
  children,
  route,
  className = "",
  rowDisposition: CustomRowDisposition = ListRowDisposition,
  isSelected = false,
  openInNewTab = false,
  navigate,
}: ListRowProps) => {
  return (
    <div className="group relative mt-1 w-full">
      <div
        className={`relative bg-overlay-panel p-[10px] backdrop-blur-[60px] hover-lift-row ${isSelected ? "before:bg-list-row-hover" : ""} // Selected state styling ${className} `}
      >
        <Link
          href={route}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
          className={navigate ? "cursor-pointer" : undefined}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest(".stop-navigation")) {
              e.preventDefault()
              return
            }

            if (navigate) {
              e.preventDefault()
              navigate()
            }
          }}
        >
          <CustomRowDisposition>
            <> {children?.at(0)}</>
            <> {children?.at(1)}</>
            <> {children?.at(2)}</>
          </CustomRowDisposition>
        </Link>
      </div>

      <ListGradientBorder />
    </div>
  )
}
