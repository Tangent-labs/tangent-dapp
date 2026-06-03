export interface BalancerAprItem {
  title: string
  apr: number
  type: string
}

export interface BalancerPoolToken {
  address: string
  symbol: string
  balance: string
  balanceUSD: string
}

export interface BalancerDynamicData {
  totalLiquidity: string
  totalShares: string
  volume24h: string
  fees24h: string
  swapFee: string
  aprItems: BalancerAprItem[]
}

export interface BalancerPool {
  id: string
  address: string
  name: string
  symbol: string
  type: string
  poolTokens: BalancerPoolToken[]
  dynamicData: BalancerDynamicData
}

const BALANCER_API_URL = "https://api-v3.balancer.fi/graphql"

// Plural `poolGetPools` with an `idIn` filter fetches every address in ONE
// request, instead of one round-trip per pool. Not-found ids are simply absent
// from the returned list (no nulls to filter).
const POOLS_QUERY = `
  query GetBalancerPools($ids: [String!]!, $chains: [GqlChain!]!) {
    poolGetPools(where: { idIn: $ids, chainIn: $chains }) {
      id
      address
      name
      symbol
      type
      poolTokens {
        address
        symbol
        balance
        balanceUSD
      }
      dynamicData {
        totalLiquidity
        totalShares
        volume24h
        fees24h
        swapFee
        aprItems {
          title
          apr
          type
        }
      }
    }
  }
`

/** Shape of a GraphQL error entry (only the message is consumed). */
interface GraphQLError {
  message: string
}

interface PoolGetPoolsResponse {
  data?: { poolGetPools: BalancerPool[] }
  errors?: GraphQLError[]
}

/**
 * Fetch many Balancer v3 pools in a single request.
 *
 * @param addresses Pool addresses — used directly as the GraphQL `id`s for v3 pools.
 * @returns The matching pools. Addresses with no pool on MAINNET are omitted.
 * @throws  When the request fails or the API responds with GraphQL `errors`.
 */
export const getBalancerPools = async (addresses: string[]): Promise<BalancerPool[]> => {
  if (addresses.length === 0) return []

  const response = await fetch(BALANCER_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: POOLS_QUERY,
      variables: { ids: addresses, chains: ["MAINNET"] },
    }),
  })

  if (!response.ok) {
    throw new Error(`Balancer API request failed: ${response.status} ${response.statusText}`)
  }

  const json: PoolGetPoolsResponse = await response.json()

  if (json.errors?.length) {
    throw new Error(`Balancer GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`)
  }

  return json.data?.poolGetPools ?? []
}

/** Convenience wrapper for a single pool. Returns `null` if not found. */
export const getBalancerPool = async (address: string): Promise<BalancerPool | null> => {
  const [pool] = await getBalancerPools([address])
  return pool ?? null
}
