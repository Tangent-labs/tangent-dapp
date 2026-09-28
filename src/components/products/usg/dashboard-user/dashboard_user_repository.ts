import { MOCK_USER_DASHBOARD } from "./dashboard_user_mock"
import { buildUserDashboardData } from "./dashboard_user_adapters"
import { fetchDashboardSources } from "./dashboard_user_sources"
import type { UserDashboardData } from "./dashboard_user_type"

// NEXT_PUBLIC_USER_DASHBOARD_MOCK=true shows the fake data of dashboard_user_mock.ts (design and demo)
export const IS_USER_DASHBOARD_MOCK = process.env.NEXT_PUBLIC_USER_DASHBOARD_MOCK === "true"

/**
 * SINGLE ENTRY POINT of the data of the user dashboard: the context and the components only depend on the
 * `UserDashboardData` it returns (see dashboard_user_type.ts).
 *
 * Today the data comes from what the dapp already loads (on-chain views and the existing API client):
 *   fetchDashboardSources()   ->  dashboard_user_sources.ts   (what is fetched)
 *   buildUserDashboardData()  ->  dashboard_user_adapters.ts  (mapping, totals, allocation, earnings estimation)
 *
 * To plug the backend, replace the body of this function, e.g. :
 *
 *   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${address}/dashboard`)
 *   if (!response.ok) throw new Error(`User dashboard request failed with status ${response.status}`)
 *   return (await response.json()) as UserDashboardData
 *
 * The backend can also fill only what the dapp cannot compute (Curve LPs, real earnings) and let the adapters do
 * the rest. See README.md for the source of every field.
 */
export const getUserDashboardData = async (address: string): Promise<UserDashboardData> => {
  if (IS_USER_DASHBOARD_MOCK) return MOCK_USER_DASHBOARD

  const sources = await fetchDashboardSources(address)

  return buildUserDashboardData(address, sources)
}
