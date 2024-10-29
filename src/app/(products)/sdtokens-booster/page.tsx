import { ListProvider } from "@/components/design_system/list/list_context"
import { getGrid1Data } from "@/services/service_design_system"
import { ListState } from "@/types"
import MockUpList from "@/components/products/examples/list/mockup_list"

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
      <MockUpList />
    </ListProvider>
  )
}

export default ExmapleListPage
