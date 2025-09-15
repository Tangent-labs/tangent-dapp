"use client"

import { Button } from "@/components/design_system/inputs/button"
import Divider from "@/components/design_system/structure/divider"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useRsTanContext } from "./rstan_layout_context"
import { formatBigInt } from "@/lib/number_formatter"
import { IconChevron } from "@/components/icons/icon_chevron"
import { formatDate } from "@/lib/other_formatter"
import { ListState } from "@/types"
import { ListProvider, useListContext } from "@/components/design_system/list/list_context"
import { lockListHeaders } from "./rstan_layout_controller"
import ListHeader from "@/components/design_system/list/list_header"
import ListRow from "@/components/design_system/list/list_row"
import EvolutionBox from "@/components/design_system/structure/evolution_box"
import { IconCircleHelp } from "@/components/icons"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import { IconVsTan } from "@/components/icons/icon_vstan"
import { LockPosition } from "../tg_usd/tg_usd_type"
import TokenImage from "@/components/design_system/structure/token_image"
import { InfinityIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { FeatureSelect } from "@/components/design_system/structure/feature_select"

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

export const RsTanLayoutContent = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const router = useRouter()

  const pathname = usePathname()

  const { lockData, feature } = useRsTanContext()

  const onTabClick = (feat: string) => {
    router.push(`/tan/${feat.toLowerCase()}`)
  }

  return (
    <>
      <div className="mb-3 flex w-full items-center justify-between gap-6">
        <div className="usg-header hidden w-1/2 xl:flex">
          <div className="flex items-center justify-center">
            <Image height={360} width={360} src={`/medias/tokens/vsTAN.png`} alt="token" />
          </div>
          <div className="ml-6 flex flex-col items-start justify-between gap-3">
            <span className="mt-1 text-5xl font-semibold">Lock TAN</span>

            <span className="text-[15px]">
              Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools (SDT
              stable pool & CVX stable pool).
            </span>
            <span className="text-[15px]">
              Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs. Learn more
            </span>
          </div>
        </div>

        <div className="flex h-full w-full flex-col items-center gap-8 rounded-[10px] xl:w-1/2">
          <div className="flex h-16 w-full items-center justify-start rounded-[10px] bg-[url('/medias/pointsCampaign.png')] bg-[position:calc(100%+40px)_center] bg-no-repeat px-6 !text-[20px] !font-semibold italic">
            Points campaign
            <div className="ml-2 flex items-center justify-center rounded-[10px] bg-tonic px-2 py-0.5 !font-semibold !not-italic !text-black">Live</div>
          </div>

          <div className="justify-bewteen flex w-full items-center rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
            <IconVsTan className="h-10 w-32"></IconVsTan>

            <div className="flex w-full flex-col items-center justify-center">
              <div className="text-xs font-semibold text-subtitle">Total Locked</div>
              <div className="text-md font-semibold text-white">{formatBigInt(lockData?.totalLocked, 18, 2)}</div>
            </div>

            <div className="flex w-full flex-col items-center justify-center">
              <div className="text-xs font-semibold text-subtitle">vsTan</div>
              <div className="text-md font-semibold text-white">$1.23</div>
            </div>

            <div className="flex w-full flex-col items-center justify-center rounded-lg bg-button-active py-2">
              <div className="text-xs font-semibold text-black">APR</div>
              <div className="text-md font-semibold text-white">{formatBigInt(lockData?.tanAPR, 18, 2)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex w-full flex-col gap-4 xl:flex-row">
        <div className="flex w-full flex-col items-center justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px] xl:w-5/12">
          <div className="hidden w-full items-center justify-between gap-2 md:flex">
            <ButtonTab label="Lock" active={pathname === "/tan/lock"} onClick={() => onTabClick("lock")} className="h-8! flex w-full justify-center" />
            <ButtonTab label="Unlock" active={pathname === "/tan/unlock"} onClick={() => onTabClick("unlock")} className="h-8! flex w-full justify-center" />
            <ButtonTab label="Claim" active={pathname === "/tan/claim"} onClick={() => onTabClick("claim")} className="h-8! flex w-full justify-center" />
            <ButtonTab label="Split" active={pathname === "/tan/split"} onClick={() => onTabClick("split")} className="h-8! flex w-full justify-center" />
            <ButtonTab label="Merge" active={pathname === "/tan/merge"} onClick={() => onTabClick("merge")} className="h-8! flex w-full justify-center" />
          </div>

          <div className="flex w-full flex-col items-center justify-between gap-1 md:hidden">
            <FeatureSelect options={["Lock", "Unlock", "Claim", "Split", "Merge"]} value={feature} onChange={(v: string) => onTabClick(v)}></FeatureSelect>
          </div>

          <Divider className="h-0.5 w-full bg-white/10" />

          {children}
        </div>

        <div className="flex w-full flex-col items-start justify-start rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px] xl:w-7/12">
          <div className="mr-auto text-3xl font-semibold text-white">Locked Positions</div>

          <Divider className="h-0.5 w-full bg-white/10" />

          <ListProvider customSort={() => {}} _headers={lockListHeaders} _rows={[]} _listState={listeState}>
            <LockPositionList></LockPositionList>
          </ListProvider>
        </div>
      </div>
    </>
  )
}

function LockPositionList() {
  const { headers, listState, udpateSort } = useListContext()

  const { lockData, selectedPosition, extendToPermaLock, setSelectedPosition, onClickExtend, setExtendToPermaLock, onClickRemovePermaLock } = useRsTanContext()

  return (
    <>
      <div className="mb-2 w-full rounded-[10px] backdrop-blur-[60px]">
        <ListHeader rowDisposition={LockRowDisposition} headers={headers} activeSort={listState?.sort} onSort={udpateSort} />
      </div>

      <div className="flex h-full max-h-[400px] w-full flex-col overflow-y-scroll">
        {lockData?.positions.map((lockPosition: LockPosition) => (
          <div className="flex w-full flex-col" key={lockPosition?.tokenId}>
            <ListRow
              navigate={() => setSelectedPosition(!!selectedPosition && lockPosition === selectedPosition ? undefined : lockPosition)}
              className="mt-2 w-full"
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
                <div className="flex w-1/3 items-center justify-center text-lg font-semibold">
                  {formatBigInt(lockPosition?.claimable, 18, 2)}
                  <TokenImage token="USG" className="ml-1" size={16} />
                </div>
                <div className="flex w-1/3 items-center justify-center text-lg font-semibold">
                  {lockPosition?.endLockTime && lockPosition?.endLockTime == "281474976710655" ? (
                    <InfinityIcon className="w-5"></InfinityIcon>
                  ) : (
                    <> {formatDate(new Date(Number(lockPosition?.endLockTime) * 1000), "dd/MM/yyyy")}</>
                  )}
                </div>
                <div className="hidden w-3/12 items-center justify-center text-lg font-semibold xl:flex">
                  <IconChevron className={`w-4 ${lockPosition == selectedPosition ? "" : "-rotate-90"} `}></IconChevron>
                </div>
              </>
            </ListRow>

            {lockPosition == selectedPosition && (
              <div className="slide-down-fade-in flex w-full flex-wrap items-center justify-between gap-3 rounded-b-lg bg-overlay-panel p-3 md:flex-row">
                <div className="flex items-center justify-center gap-2">
                  <div className="hidden w-full text-sm text-subtitle md:flex">Unlock date</div>
                  <EvolutionBox
                    originalValue={formatDate(new Date(), "dd/MM/yyyy")}
                    label=""
                    newValue={
                      (lockPosition?.endLockTime && lockPosition?.endLockTime == "281474976710655") || extendToPermaLock ? (
                        <InfinityIcon className="mx-8 w-5"></InfinityIcon>
                      ) : (
                        <> {formatDate(new Date(Number(lockPosition?.endLockTime) * 1000), "dd/MM/yyyy")}</>
                      )
                    }
                  />
                </div>

                {!!lockPosition?.endLockTime && lockPosition?.endLockTime == "281474976710655" ? (
                  <>
                    <Button onClick={() => onClickRemovePermaLock()}> Remove permalock</Button>
                  </>
                ) : (
                  <>
                    <div className="flex w-fit items-center justify-center gap-1">
                      <div className="text-xs font-semibold text-subtitle">Perma lock</div>
                      <IconCircleHelp className="w-3"></IconCircleHelp>
                      <Switch checked={extendToPermaLock} onCheckedChange={() => setExtendToPermaLock(!extendToPermaLock)} />
                    </div>

                    <Button onClick={() => onClickExtend(selectedPosition)}> Extend</Button>
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
