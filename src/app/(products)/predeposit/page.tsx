"use client"
import { PredepositContent } from "@/components/products/predeposit/predeposit.content"
import { PredepositProvider } from "@/components/products/predeposit/predeposit.context"
import { mapPoolsAndTasks } from "@/components/products/usg/earn/usg_earn_controller"
import { getConvexPools, getCurvePools, getPendlePools, getStakeDAOPools } from "@/components/products/usg/server_api"

import { opportunities } from "../(usg)/earn/aprOpportunities.json"

const fetchPoolsData = async () => {
  const [curvePools, convexPools, stakeDaoPools, pendlePools] = await Promise.all([getCurvePools(), getConvexPools(), getStakeDAOPools(), getPendlePools()])

  const mappedPools = mapPoolsAndTasks(curvePools, convexPools, stakeDaoPools, pendlePools, opportunities)

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
