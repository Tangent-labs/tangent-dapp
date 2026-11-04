"use client"

import { ListState } from "@/types"
import { useRouter } from "next/navigation"
import { LockPosition } from "../usg/usg_type"
import { Switch } from "@/components/ui/switch"
import { formatDate } from "@/lib/other_formatter"
import { formatBigInt } from "@/lib/number_formatter"
import { useVsTanContext } from "./vstan_layout_context"
import { useNextEndLockTime } from "./use_next_end_lock_time"
import { IconInfinity } from "@/components/icons/icon_infinity"
import { IconChevron, IconCircleHelp } from "@/components/icons"
import { Button } from "@/components/design_system/inputs/button"
import { ListRow } from "@/components/design_system/list/list_row"
import { IconSingleArrow } from "@/components/icons/icon_single_arrow"
import { Divider } from "@/components/design_system/structure/divider"
import { ListHeader } from "@/components/design_system/list/list_header"
import { isPermaLocked, lockListHeaders } from "./vstan_layout_controller"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { VsTanFeatureTabs } from "./vs_tan_features_tabs/vs_tan_features_tabs"
import { EvolutionBox } from "@/components/design_system/structure/evolution_box"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "id",
    direction: "asc",
  },
}

const LockRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    // Grid so header and row cells share the exact same columns : 4 equal data columns + a narrow chevron one
    <div className="grid grid-cols-4 items-center xl:grid-cols-[repeat(4,minmax(0,1fr))_2rem]">
      {children?.at(0)}
      {children?.at(1)}
      {children?.at(2)}
    </div>
  )
}

export const VsTanLayoutContent = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const router = useRouter()

  const { feature } = useVsTanContext()

  const onTabClick = (feat: string) => {
    router.push(`/tan/${feat.toLowerCase()}`)
  }

  return (
    <>
      <div className="my-4 flex w-full flex-col gap-[20px] xl:flex-row">
        <ReliefCard className="flex w-full flex-col items-center justify-start p-[20px] xl:w-5/12">
          <VsTanFeatureTabs feature={feature} onTabClick={onTabClick} />

          <Divider />

          {children}
        </ReliefCard>

        {/* The action card alone sets the row height : the absolute inner column fills it exactly, so both
            bottoms line up and an expanding position scrolls inside the list instead of growing the row */}
        <div className="w-full xl:relative xl:w-7/12">
          <div className="flex w-full flex-col items-start justify-start xl:absolute xl:inset-0">
            <div className="mr-auto text-3xl font-semibold text-white">Locked Positions</div>

            <Divider />

            <ListProvider _headers={lockListHeaders} _rows={[]} _listState={listeState}>
              <LockPositionList></LockPositionList>
            </ListProvider>
          </div>
        </div>
      </div>
    </>
  )
}

// One shared element : EvolutionBox compares old and new by reference, so both helpers must
// return the very same instance for an already-infinite date to read as unchanged.
const infinityDate = <IconInfinity className="h-auto w-5" />

// Unlock date a position currently has
const currentUnlockDate = (position: LockPosition) => {
  if (isPermaLocked(position)) return infinityDate

  return formatDate(new Date(Number(position?.endLockTime) * 1000), "dd/MM/yyyy")
}

// Unlock date the Extend button would move it to : perma lock never unlocks, otherwise the lock is
// reset to its full duration
const extendedUnlockDate = (position: LockPosition, extendToPermaLock: boolean, nextEndLockTime: string | null) => {
  if (isPermaLocked(position)) return infinityDate

  if (extendToPermaLock) return infinityDate

  if (!nextEndLockTime) return currentUnlockDate(position)

  return formatDate(new Date(Number(nextEndLockTime) * 1000), "dd/MM/yyyy")
}

function LockPositionList() {
  const router = useRouter()

  const { headers, listState, udpateSort } = useListContext()

  const { lockData, selectedPosition, setSelectedPosition, extendToPermaLock, onClickExtend, setExtendToPermaLock, onClickRemovePermaLock, feature } =
    useVsTanContext()

  const { nextEndLockTime } = useNextEndLockTime(lockData)

  // lockData is undefined until the first fetch resolves : keep the bare header rather than
  // flashing the empty state at every page load
  if (lockData && lockData.positions.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-3 py-16">
        <TokenImage token="VSTAN" size={48} className="w-12" />

        <div className="text-lg font-semibold text-white">No locked positions yet</div>

        <div className="max-w-72 text-center text-xs text-subtitle">Lock TAN to create your first position and start earning weekly rewards.</div>

        {feature !== "lock" && (
          <Button size="sm" className="mt-2 w-28" onClick={() => router.push("/tan/lock")}>
            Lock TAN
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      {/* The rows always keep a 6px gutter for the scrollbar (scrollbar-thin width) : same offset on the header so columns line up */}
      <div className="w-full pr-1.5">
        <ListHeader rowDisposition={LockRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      <div className="scrollbar-thin flex h-full max-h-[400px] min-h-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] xl:max-h-none">
        {lockData?.positions.map((lockPosition: LockPosition) => (
          <div className="flex w-full flex-col" key={lockPosition?.tokenId}>
            <ListRow
              route=""
              navigate={() => setSelectedPosition(lockPosition === selectedPosition ? undefined : lockPosition)}
              className="w-full will-change-transform xl:px-4"
              rowDisposition={LockRowDisposition}
              isSelected={lockPosition == selectedPosition}
            >
              <div className="flex w-fit items-center justify-center justify-self-center rounded-[10px] px-2 py-1.5 text-xs backdrop-blur-[60px] md:text-[15px]">
                #{lockPosition?.tokenId}
              </div>
              <div className="flex items-center justify-center text-xs md:text-[15px]">
                {formatBigInt(lockPosition?.amount, 18, 2)}

                <TokenImage token="VSTAN" size={16} className="ml-1 w-4" />
              </div>

              <>
                <div className="flex items-center justify-center text-xs md:text-[15px]">
                  {formatBigInt(lockPosition?.claimable, 18, 2)}
                  <TokenImage token="USG" className="ml-1" size={16} />
                </div>
                <div className="flex items-center justify-center whitespace-nowrap text-xs md:text-[15px]">
                  {isPermaLocked(lockPosition) ? (
                    <IconInfinity className="w-4" />
                  ) : (
                    <>
                      {/* Two-digit year on small screens : the date is the widest cell and was clipping */}
                      <span className="sm:hidden">{formatDate(new Date(Number(lockPosition?.endLockTime) * 1000), "dd/MM/yy")}</span>
                      <span className="hidden sm:inline">{formatDate(new Date(Number(lockPosition?.endLockTime) * 1000), "dd/MM/yyyy")}</span>
                    </>
                  )}
                </div>
                <div className="hidden items-center justify-center xl:flex">
                  <IconChevron className={`w-4 ${lockPosition == selectedPosition ? "" : "-rotate-90"} `}></IconChevron>
                </div>
              </>
            </ListRow>

            {lockPosition == selectedPosition && (
              <div className="slide-down-fade-in flex w-full flex-wrap rounded-b-lg bg-overlay-panel px-3 backdrop-blur-[60px]">
                <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-b-lg border-t border-white/10 py-[10px]">
                  <div className="flex items-center justify-start gap-3 sm:shrink-0">
                    <div className="hidden text-sm text-subtitle md:flex">Unlock date</div>

                    {/* The boxed EvolutionBox is too wide for one row on mobile : plain text there, animated box from sm up */}
                    <div className="flex items-center gap-2 text-sm font-semibold sm:hidden">
                      <span>{currentUnlockDate(lockPosition)}</span>

                      {extendedUnlockDate(lockPosition, extendToPermaLock, nextEndLockTime) !== currentUnlockDate(lockPosition) && (
                        <>
                          <IconSingleArrow className="h-3 w-3" />
                          <span style={{ color: "var(--tgt-tonic)" }}>{extendedUnlockDate(lockPosition, extendToPermaLock, nextEndLockTime)}</span>
                        </>
                      )}
                    </div>

                    <EvolutionBox
                      className="hidden w-[232px] sm:flex sm:justify-center"
                      originalValue={currentUnlockDate(lockPosition)}
                      newValue={extendedUnlockDate(lockPosition, extendToPermaLock, nextEndLockTime)}
                    />
                  </div>

                  {isPermaLocked(lockPosition) ? (
                    <>
                      <Button className="w-40" onClick={() => onClickRemovePermaLock()}>
                        Remove permalock
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex w-fit items-center justify-center gap-1">
                        <div className="flex items-center justify-center gap-1 text-xs">
                          Permalock
                          <HoverCard openDelay={100} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              <button type="button">
                                <IconCircleHelp className="h-auto w-[12px] fill-white" />
                              </button>
                            </HoverCardTrigger>

                            <HoverCardContent side="top" align="center" className="z-101 w-fit max-w-64 p-2 text-xs">
                              Lock your tokens in perpetuity. You can remove the permalock option at any time.
                            </HoverCardContent>
                          </HoverCard>
                        </div>

                        <Switch checked={extendToPermaLock} onCheckedChange={() => setExtendToPermaLock(!extendToPermaLock)} />
                      </div>

                      <Button size="sm" className="w-24" onClick={() => onClickExtend(selectedPosition)}>
                        Extend
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
