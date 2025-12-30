import { PredepositContent } from "@/components/products/predeposit/predeposit.content"
import { PredepositProvider } from "@/components/products/predeposit/predeposit.context"
import { mapPoolsAndTasks } from "@/components/products/usg/earn/usg_earn_controller"
import { getConvexPools, getCurvePools, getStakeDAOPools } from "@/components/products/usg/server_api"

import mockJson from "../(usg)/earn/earnMock.json"

const fetchPoolsData = async () => {
  const [curvePools, convexPools, stakeDaoPools] = await Promise.all([getCurvePools(), getConvexPools(), getStakeDAOPools()])

  const mappedPools = mapPoolsAndTasks(curvePools, convexPools, stakeDaoPools, mockJson?.tasks)

  return mappedPools
}

const opportunitiesData = await fetchPoolsData()

export default function PredepositPage() {
  return (
    <PredepositProvider>
      <PredepositContent opportunitiesData={opportunitiesData}></PredepositContent>
    </PredepositProvider>
  )
}
