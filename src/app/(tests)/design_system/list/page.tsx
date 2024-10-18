import ListExample1 from "@/components/pages/examples/list/example_list_1"
import { ListProvider } from "@/components/design_system/list/list_context"
import { getGrid1Data } from "@/services/service_design_system"
import { ListState } from "@/types"

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
    <ListProvider _headers={headers} _rows={rows} _listState={listeState}>
      <ListExample1 />
    </ListProvider>
  )
}

export default ExmapleListPage
