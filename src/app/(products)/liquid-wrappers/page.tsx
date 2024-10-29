import { ListProvider } from "@/components/design_system/list/list_context"
import { getGrid1Data } from "@/services/service_design_system"
import { ListState } from "@/types"
import MockUpList from "@/components/products/examples/list/mockup_list"
import IndicatorCards from "@/components/design_system/structure/indicators_card"

const { headers, rows } = await getGrid1Data()
const listeState: ListState = {
  search: undefined,
  sort: {
    key: "strategy",
    direction: "asc",
  },
}

const ExmapleListPage = async () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <IndicatorCards indicators={[{ title: "Epoch", value: "Next reward: 20days, 10 hours" }]} />
        </div>
        <div className="flex gap-4">
          <IndicatorCards indicators={[{ title: "TVL", value: "$5,0000,000" }]} />
          <IndicatorCards
            indicators={[
              { title: "Total deposited", value: "$300,000" },
              { title: "Total claimable", value: "$100,000" },
            ]}
          />
        </div>
      </div>

      <ListProvider _headers={headers} _rows={rows} _listState={listeState}>
        <MockUpList />
      </ListProvider>
    </div>
  )
}

export default ExmapleListPage
