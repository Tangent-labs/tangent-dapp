"use client"

import { ListRowDisposition } from "@/components/design_system/list/list_row_disposition"

// Column widths shared by the header and the rows of the position tables so they stay aligned (desktop)

// Header bar of every position table: same height and same padding around every label (the sortable labels have a 5px
// padding, the others get it too), so a label like "Collateral" is at the same place in all the tables
export const POSITION_HEADER_CLASSNAME =
  "mt-0 [&>div:first-child>*]:w-full [&>div:first-child]:flex [&>div:first-child]:h-[40px] [&>div:first-child]:items-center [&>div:first-child]:px-2.5 [&_.text-subtitle]:p-[5px]"

// ---------------------------
// BORROW MARKET: [collateral] [deposited] [all the other columns] [action]
// ---------------------------
export const BORROW_COLUMNS = {
  collateral: "w-full xl:w-[22%] xl:shrink-0",
  deposited: "xl:w-[12%] xl:flex-none",
  action: "hidden w-8 shrink-0 items-center justify-end xl:flex",
}

export const BorrowHeaderDisposition = ({ children }: React.ComponentProps<typeof ListRowDisposition>) => (
  <div className="flex items-center">
    <div className={BORROW_COLUMNS.collateral}>{children?.at(0)}</div>
    <div className={`flex ${BORROW_COLUMNS.deposited} shrink-0 items-center justify-center`}>{children?.at(1)}</div>
    <div className="flex flex-1 items-center">{children?.at(2)}</div>
    <div className="w-8 shrink-0" />
  </div>
)

// ---------------------------
// CURVE LPs AND sUSG: [collateral 22%, same as the borrow table] [first column] [the other columns share the rest]
// ---------------------------
export const SIMPLE_COLUMNS = {
  collateral: "w-full xl:w-[22%] xl:shrink-0",
}

const createHeaderDisposition = (restCount: number) => {
  const Disposition = ({ children }: { children: React.ReactNode[] }) => (
    <div className="flex items-center">
      <div className={SIMPLE_COLUMNS.collateral}>{children?.at(0)}</div>
      <div className="flex flex-1 items-center">{children?.at(1)}</div>
      <div className="flex items-center" style={{ flex: restCount }}>
        {children?.at(2)}
      </div>
    </div>
  )
  return Disposition
}

// Curve LPs: collateral, vAPR, then Deposited / Claimable / Claim
export const CurveLPHeaderDisposition = createHeaderDisposition(3)

// sUSG: collateral, APY, then Deposited / Balance
export const SUSGHeaderDisposition = createHeaderDisposition(2)
