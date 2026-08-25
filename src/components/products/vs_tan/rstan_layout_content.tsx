"use client"

import { ListState } from "@/types"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { formatDate } from "@/lib/other_formatter"
import { LockPosition } from "../usg/usg_type"
import { formatBigInt } from "@/lib/number_formatter"
import { useVsTanContext } from "./rstan_layout_context"
import { IconChevron } from "@/components/icons"
import { isPermaLocked, lockListHeaders } from "./rstan_layout_controller"
import { ListRow } from "@/components/design_system/list/list_row"
import { EvolutionBox } from "@/components/design_system/structure/evolution_box"
import { useNextEndLockTime } from "./use_next_end_lock_time"
import { Button } from "@/components/design_system/inputs/button"
import { Divider } from "@/components/design_system/structure/divider"
import { ListHeader } from "@/components/design_system/list/list_header"
import { TokenImage } from "@/components/design_system/structure/token_image"
import { ReliefCard } from "@/components/design_system/structure/relief_card"
import { VsTanFeatureTabs } from "./vs_tan_features_tabs/vs_tan_features_tabs"
import { USGHoverCard } from "@/components/design_system/structure/usg_hover_card"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { IconInfinity } from "@/components/icons/icon_infinity"
import { IconSingleArrow } from "@/components/icons/icon_single_arrow"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "id",
    direction: "asc",
  },
}

const LockRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex w-5/12 items-center justify-evenly xl:justify-start">
        <div className="xl:w-1/2">{children?.at(0)}</div>
        <div className="flex justify-center xl:w-1/2">{children?.at(1)}</div>
      </div>
      <div className="flex w-7/12 items-center justify-between">{children?.at(2)}</div>
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

        <div className="flex w-full flex-col items-start justify-start xl:w-7/12">
          <div className="mr-auto text-3xl font-semibold text-white">Locked Positions</div>

          <Divider />

          <ListProvider _headers={lockListHeaders} _rows={[]} _listState={listeState}>
            <LockPositionList></LockPositionList>
          </ListProvider>
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
      <ListHeader rowDisposition={LockRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />

      <div className="flex h-full max-h-[400px] w-full flex-col overflow-x-hidden overflow-y-scroll">
        {lockData?.positions.map((lockPosition: LockPosition) => (
          <div className="flex w-full flex-col" key={lockPosition?.tokenId}>
            <ListRow
              route=""
              navigate={() => setSelectedPosition(lockPosition === selectedPosition ? undefined : lockPosition)}
              className="w-full"
              rowDisposition={LockRowDisposition}
              isSelected={lockPosition == selectedPosition}
            >
              <div className="flex items-center justify-center rounded-[10px] px-2 py-1.5 text-lg font-semibold backdrop-blur-[60px]">
                #{lockPosition?.tokenId}
              </div>
              <div className="flex items-center justify-center text-lg font-semibold">
                {formatBigInt(lockPosition?.amount, 18, 2)}

                <TokenImage token="VSTAN" size={16} className="ml-1 w-4" />
              </div>

              <>
                <div className="flex w-1/2 items-center justify-center text-sm font-semibold sm:text-lg xl:w-1/3">
                  {formatBigInt(lockPosition?.claimable, 18, 2)}
                  <TokenImage token="USG" className="ml-1" size={16} />
                </div>
                <div className="flex w-1/2 items-center justify-center whitespace-nowrap text-sm font-semibold sm:text-lg xl:w-1/3">
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
                <div className="hidden w-3/12 items-center justify-center text-lg font-semibold xl:flex">
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
                        <div className="whitespace-nowrap text-xs font-semibold text-subtitle">Perma lock</div>

                        <USGHoverCard iconClassName="h-auto w-[14px] text-white" title="">
                          Lock your tokens in perpetuity. You can remove the perma lock option at any time.
                        </USGHoverCard>

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
