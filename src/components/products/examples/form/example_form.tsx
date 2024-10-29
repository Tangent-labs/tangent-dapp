"use client"
import InputAssetValue, { inputAssetValueFullOption } from "@/components/design_system/inputs/input_asset_value"
import InputSelectAsset from "@/components/design_system/inputs/input_select_asset"
import InputSelect from "@/components/design_system/inputs/input_select"
import Panel from "@/components/design_system/structure/panel"
import FormButtons from "@/components/design_system/form/form_actions"
import { useContext } from "react"
import { exampleFormContext } from "@/components/products/examples/form/example_form_context"
import { ExampleFormAssetType, ExampleFormContextValue } from "@/components/products/examples/form/example_form_type"

export const ExampleForm = () => {
  const { formState, currentAsset, assetOptions, updateFormValues, formValues, setUpData, actionApprove, actionDeposit } =
    useContext<ExampleFormContextValue>(exampleFormContext)

  return (
    <Panel>
      <div className="flex flex-col gap-10">
        <p className="max-w-5xl font-[13px]">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Porro quod consectetur minima rem! Pariatur voluptatem obcaecati, id voluptate nulla enim in
          sed fugit dolores unde voluptas repellat deleniti, laudantium repudiandae!
        </p>
        <div className="flex justify-between gap-2">
          <div className="flex w-2/3 justify-start gap-5">
            <div>
              <InputSelectAsset
                className="min-w-[250px]"
                options={assetOptions.options}
                optionValues={assetOptions.optionValues}
                label="Asset"
                value={formValues.assetIn}
                onChange={function (value: string): void {
                  updateFormValues("assetIn", value as ExampleFormAssetType)
                }}
              />
            </div>
            <div>
              <InputAssetValue
                className="min-w-[250px]"
                label="Deposit"
                asset={currentAsset!}
                balance={currentAsset?.balance}
                value={formValues.value}
                options={inputAssetValueFullOption(2)}
                onChange={(v) => {
                  updateFormValues("value", v)
                }}
              />
            </div>
            <div>
              <InputSelect
                className="min-w-[250px]"
                options={setUpData?.positionsOptions}
                label="Position"
                value={formValues.selectedPosition}
                onChange={function (v: string): void {
                  updateFormValues("selectedPosition", v)
                }}
              />
            </div>
          </div>
          <div className="w-1/3">
            <div className="flex justify-between gap-5">
              <FormButtons actions={{ handleApprove: actionApprove, handleProcess: actionDeposit }} formState={formState} labelProcess="Deposit & Stake" />
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
