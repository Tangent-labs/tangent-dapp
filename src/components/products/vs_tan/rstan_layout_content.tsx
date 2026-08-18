"use client"

import Image from "next/image"
import { ListState } from "@/types"
import { useRouter } from "next/navigation"
import { InfinityIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { formatDate } from "@/lib/other_formatter"
import { LockPosition } from "../usg/usg_type"
import { formatBigInt } from "@/lib/number_formatter"
import { useVsTanContext } from "./rstan_layout_context"
import { IconVsTan, IconChevron } from "@/components/icons"
import { isPermaLocked, lockListHeaders } from "./rstan_layout_controller"
import { tanPriceToDollar } from "./tan_price"
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
import { PointsCampaignLiveCard } from "@/components/design_system/structure/points_campaign_live_card"
import { PageHeader } from "@/components/design_system/structure/page_header"

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

  const { lockData, feature } = useVsTanContext()

  const onTabClick = (feat: string) => {
    router.push(`/tan/${feat.toLowerCase()}`)
  }

  return (
    <>
      <div className="flex w-full items-stretch justify-between gap-5">
        <PageHeader>
          <Image height={140} width={140} src={`/medias/tokens/vsTAN.png`} alt="token" style={{ maxWidth: "320px", maxHeight: "320px" }} />
          <div className="flex flex-col items-start justify-center gap-3 px-6">
            <span className="text-4xl font-semibold">Lock TAN</span>
            <p className="text-xs">
              Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools (SDT
              stable pool & CVX stable pool).
            </p>
            <p className="text-xs">Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs. Learn more</p>
          </div>
        </PageHeader>

        <div className="flex h-auto w-full flex-col items-center justify-between gap-3 xl:w-1/2">
          <PointsCampaignLiveCard></PointsCampaignLiveCard>

          <div className="flex w-full items-center justify-between rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
            <IconVsTan className="h-10 w-32"></IconVsTan>

            <div className="flex w-full flex-col items-center justify-center">
              <div className="text-xs font-semibold text-subtitle">Total Locked</div>
              <div className="text-md font-semibold text-white">{formatBigInt(lockData?.totalLocked, 18, 2)}</div>
            </div>

            <div className="flex w-full flex-col items-center justify-center">
              <div className="text-xs font-semibold text-subtitle">vsTan</div>
              <div className="text-md font-semibold text-white">{tanPriceToDollar(lockData?.tanPrice)}</div>
            </div>

            <div className="flex w-full flex-col items-center justify-center rounded-[10px] bg-button-active py-2">
              <div className="text-xs font-semibold text-black">APR</div>
              <div className="text-md font-semibold text-white">{formatBigInt(lockData?.tanAPR, 18, 2)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="my-4 flex w-full flex-col gap-4 xl:flex-row">
        <ReliefCard className="flex w-full flex-col items-center justify-start p-3 xl:w-5/12">
          <VsTanFeatureTabs feature={feature} onTabClick={onTabClick}></VsTanFeatureTabs>

          <Divider />

          {children}
        </ReliefCard>

        <div className="flex w-full flex-col items-start justify-start p-3 xl:w-7/12">
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

// Unlock date a position currently has
const currentUnlockDate = (position: LockPosition) => {
  if (isPermaLocked(position)) return "∞"

  return formatDate(new Date(Number(position?.endLockTime) * 1000), "dd/MM/yyyy")
}

// Unlock date the Extend button would move it to : perma lock never unlocks, otherwise the lock is
// reset to its full duration
const extendedUnlockDate = (position: LockPosition, extendToPermaLock: boolean, nextEndLockTime: string | null) => {
  if (isPermaLocked(position)) return "∞"

  if (extendToPermaLock) return "∞"

  if (!nextEndLockTime) return currentUnlockDate(position)

  return formatDate(new Date(Number(nextEndLockTime) * 1000), "dd/MM/yyyy")
}

function LockPositionList() {
  const { headers, listState, udpateSort } = useListContext()

  const { lockData, selectedPosition, setSelectedPosition, extendToPermaLock, onClickExtend, setExtendToPermaLock, onClickRemovePermaLock } = useVsTanContext()

  const { nextEndLockTime } = useNextEndLockTime(lockData)

  return (
    <>
      <div className="mb-2 w-full">
        <ListHeader rowDisposition={LockRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

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
                <IconVsTan className="ml-1 w-5"></IconVsTan>
              </div>

              <>
                <div className="flex w-1/2 items-center justify-center text-sm font-semibold sm:text-lg xl:w-1/3">
                  {formatBigInt(lockPosition?.claimable, 18, 2)}
                  <TokenImage token="USG" className="ml-1" size={16} />
                </div>
                <div className="flex w-1/2 items-center justify-center whitespace-nowrap text-sm font-semibold sm:text-lg xl:w-1/3">
                  {isPermaLocked(lockPosition) ? (
                    <InfinityIcon className="w-5"></InfinityIcon>
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
              <div className="slide-down-fade-in flex w-full flex-wrap items-center justify-between gap-3 rounded-b-lg bg-overlay-panel p-3">
                {/* Full width on mobile so the toggle and the button wrap onto their own row */}
                <div className="flex w-full items-center justify-start gap-3 sm:w-auto sm:shrink-0">
                  <div className="hidden text-sm text-subtitle md:flex">Unlock date</div>

                  <EvolutionBox
                    className="flex w-full justify-center sm:w-[232px]"
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

                    <Button className="w-24" onClick={() => onClickExtend(selectedPosition)}>
                      Extend
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
