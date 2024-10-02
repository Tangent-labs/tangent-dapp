import ListExample1 from "@/components/examples/example_list_1"
import { ListProvider } from "@/contexts/list_context"
import { getGrid1Data } from "@/service/design_system_service"
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
