"use client"
import { ExistingAsset } from "@/types"
import InputAssetValue from "../design_system/form/input_asset_value"
import InputSelectAsset from "../design_system/form/input_select_asset"
import Panel from "../design_system/structure/panel"

export const ExampleForm = () => {
  return (
    <Panel>
      <div className="flex flex-col gap-10 ">
        <p className="max-w-5xl font-[13px]">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro quod consectetur minima rem! Pariatur voluptatem obcaecati, id voluptate nulla enim in
          sed fugit dolores unde voluptas repellat deleniti, laudantium repudiandae!
        </p>
        <div className="flex gap-2 justify-between ">
          <div className="flex w-2/3 gap-5 justify-start">
            <div>
              <InputSelectAsset
                className="min-w-[250px]"
                options={["USDC", "CRV"]}
                label="Asset"
                value="CRV"
                onChange={function (value: ExistingAsset): void {
                  throw new Error(`Function not implemented. ${value}`)
                }}
              />
            </div>
            <div>
              <InputAssetValue
                className="min-w-[250px]"
                label="Deposit"
                data={{
                  value: undefined,
                  decimals: 5,
                  maxValue: BigInt("50000000000"),
                  balance: BigInt("500000000000"),
                  assetName: "USDC",
                  dollarValue: 25354,
                }}
                options={{ displayDecimals: 0, displayLabel: true, displayMax: true, displayBalance: true, displayDollarValue: true }}
                onChange={() => {}}
              />
            </div>
            <div>posisiton</div>
          </div>
          <div className="flex w-1/3 gap-5  justify-between  ">
            <div className="flex-1"> Approve </div>
            <div> --- </div>
            <div className="flex-1"> Deposit </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
