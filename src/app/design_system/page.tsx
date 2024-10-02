// in this example the data request are made server side & injected in the client component.

import IndicatorCards from "@/components/design_system/structure/indicators_card"
import ExampleTitle from "@/components/examples/example_title"
import { IndicatorData } from "@/types"

const indicators: IndicatorData[] = [
  { title: "Total Deposited", value: "$100,000" },
  { title: "Total Claimable", value: "$150,000" },
]
const indicatorTvl: IndicatorData[] = [{ title: "Global TVL", value: "$100,000" }]
const indicatorsEpoch: IndicatorData[] = [{ title: "Epoch", value: "Next reward: 20 days, 10 hours" }]
const Home = async () => {
  // Executed on the server side

  return (
    <>
      <div className="text-center">Choose your component.</div>
      <hr className="my-10 border-gray-400 border-opacity-25" />
      <ExampleTitle title="Indicator BAR" />
      <div className="flex justify-between">
        <div>
          <IndicatorCards indicators={indicatorsEpoch} />
        </div>
        <div className="flex justify-end gap-5">
          <IndicatorCards indicators={indicatorTvl} />
          <IndicatorCards indicators={indicators} />
        </div>
      </div>
    </>
  )
}

export default Home
