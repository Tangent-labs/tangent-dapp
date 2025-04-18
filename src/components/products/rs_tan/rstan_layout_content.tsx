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
import InputToggle from "@/components/design_system/inputs/input_toogle"
import ButtonTab from "@/components/design_system/inputs/button_tab"
import { IconRsTan } from "@/components/icons/icon_rstan"
import { LockPosition } from "../tg_usd/tg_usd_type"
import TokenImage from "@/components/design_system/structure/token_image"
import { InfinityIcon } from "lucide-react"

const listeState: ListState = {
  search: undefined,
  sort: {
    key: "id",
    direction: "asc",
  },
}

const LockRowDisposition = ({ children }: { children: React.ReactNode[] }) => {
  return (
    <div className="flex items-center justify-between max-xl:flex-col">
      <div className="flex w-full items-center justify-evenly xl:w-5/12 xl:justify-start">
        <div className="xl:w-1/2">{children?.at(0)}</div>
        <div className="flex justify-center xl:w-1/2">{children?.at(1)}</div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-between xl:w-7/12">{children?.at(2)}</div>
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

  const { lockData } = useRsTanContext()

  return (
    <>
      <div className="mb-3 flex w-full items-end justify-end gap-4">
        <div className="stan-card w-7/12">
          <div className="flex items-center justify-center">
            <Image height={360} width={360} src={`/medias/tokens/rsTan.png`} alt="token" />
          </div>
          <div className="ml-6 flex flex-col items-start justify-between gap-3">
            <span className="mt-1 text-5xl font-bold">Lock TAN</span>

            <span>
              Convert and stake your governance tokens to earn boosted yield while staying liquid. It is also possible to provide liquidity in stable pools (SDT
              stable pool & CVX stable pool).
            </span>
            <span>Rewards are distributed weekly, at the beginning of each epoch. Staking positions are represented by NFTs. Learn more</span>
          </div>
        </div>

        <div className="flex w-5/12 items-center justify-around rounded-[10px] bg-overlay-panel p-3 backdrop-blur-[60px]">
          <IconRsTan></IconRsTan>

          <div className="flex w-20 flex-col items-center justify-center">
            <div className="text-xs font-bold text-subtitle">Supply</div>
            <div className="text-md font-bold text-white">{formatBigInt(lockData?.totalSupply, 18, 2)}</div>
          </div>

          <div className="flex w-20 flex-col items-center justify-center">
            <div className="text-xs font-bold text-subtitle">rsTan</div>
            <div className="text-md font-bold text-white">$1.23</div>
          </div>

          <div className="flex w-20 flex-col items-center justify-center rounded-lg bg-button-active py-2">
            <div className="text-xs font-bold text-black">APR</div>
            <div className="text-md font-bold text-white">{formatBigInt(lockData?.tanAPR, 18, 2)}%</div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex w-full gap-4">
        <div className="flex w-5/12 flex-col items-center justify-start rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
          <div className="flex w-full items-center justify-between">
            <ButtonTab label="Lock" active={pathname === "/tan/lock"} onClick={() => router.push("/tan/lock")} className="h-8! flex w-20 justify-center" />
            <ButtonTab
              label="Unlock"
              active={pathname === "/tan/unlock"}
              onClick={() => router.push("/tan/unlock")}
              className="h-8! flex w-20 justify-center"
            />
            <ButtonTab label="Claim" active={pathname === "/tan/claim"} onClick={() => router.push("/tan/claim")} className="h-8! flex w-20 justify-center" />
            <ButtonTab label="Split" active={pathname === "/tan/split"} onClick={() => router.push("/tan/split")} className="h-8! flex w-20 justify-center" />
            <ButtonTab label="Merge" active={pathname === "/tan/merge"} onClick={() => router.push("/tan/merge")} className="h-8! flex w-20 justify-center" />
          </div>

          <Divider className="h-0.5 w-full bg-white/10" />

          {children}
        </div>

        <div className="flex w-7/12 flex-col items-start justify-start rounded-[10px] bg-white bg-opacity-[5%] p-3 backdrop-blur-[60px]">
          <div className="mr-auto text-3xl font-bold text-white">Locked Positions</div>

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
              <div className="flex items-center justify-center rounded-xl px-2 py-1.5 text-lg font-bold backdrop-blur-[60px]">#{lockPosition?.tokenId}</div>
              <div className="flex items-center justify-center text-lg font-bold">
                {formatBigInt(lockPosition?.amount, 18, 2)}
                <IconRsTan className="ml-1 w-5"></IconRsTan>
              </div>

              <>
                <div className="flex w-4/12 items-center justify-center text-lg font-bold">
                  {formatBigInt(lockPosition?.claimable, 18, 2)}
                  <TokenImage token="tgUSD" className="ml-1" size={16} />
                </div>
                <div className="flex w-4/12 items-center justify-center text-lg font-bold">
                  {lockPosition?.endLockTime && lockPosition?.endLockTime == "281474976710655" ? (
                    <InfinityIcon className="w-5"></InfinityIcon>
                  ) : (
                    <> {formatDate(new Date(Number(lockPosition?.endLockTime) * 1000), "dd/MM/yyyy")}</>
                  )}
                </div>
                <div className="flex w-3/12 items-center justify-center text-lg font-bold">
                  <IconChevron className={`w-4 ${lockPosition == selectedPosition ? "" : "-rotate-90"} `}></IconChevron>
                </div>
              </>
            </ListRow>

            {lockPosition == selectedPosition && (
              <div className="slide-down-fade-in flex w-full items-center justify-between rounded-b-lg bg-overlay-panel p-3">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-20 text-sm text-subtitle">Unlock date</div>
                  <EvolutionBox
                    originalValue={formatDate(new Date(), "dd/MM/yyyy")}
                    label=""
                    newValue={
                      lockPosition?.endLockTime && lockPosition?.endLockTime == "281474976710655" ? (
                        <InfinityIcon className="w-5"></InfinityIcon>
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
                    <div className="flex w-full items-center justify-center gap-1">
                      <div className="text-xs font-bold text-subtitle">Perma lock</div>
                      <IconCircleHelp className="w-3"></IconCircleHelp>
                      <InputToggle isOn={extendToPermaLock} onToggle={() => setExtendToPermaLock(!extendToPermaLock)}></InputToggle>
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
