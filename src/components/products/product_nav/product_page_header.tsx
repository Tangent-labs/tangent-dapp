"use client"

import { PageHeader } from "@/components/design_system/structure/list_page_header"
import React from "react"
import { useNavigationContext } from "./navigation_context"
import { cn } from "@/lib/utils"

export default function ProductPageHeader() {
  const { currentProduct } = useNavigationContext()

  return (
    <div className={cn("mb-4 flex content-center")}>
      <PageHeader product={currentProduct} />
    </div>
  )
}
