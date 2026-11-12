# User dashboard (`/dashboard/user`)

Portfolio page of a wallet: totals, earnings, allocation, and the positions (Borrow Market, Curve LPs staked, sUSG).

## How the data flows

```
page.tsx
  USGDashboardUserProvider            dashboard_user_context.tsx     loads once per wallet
    getUserDashboardData(address)     dashboard_user_repository.ts   SINGLE ENTRY POINT (swap point for the backend)
      fetchDashboardSources()         dashboard_user_sources.ts      what is fetched (on-chain views + existing API client)
      buildUserDashboardData()        dashboard_user_adapters.ts     mapping of the sources to the positions
  USGDashboardUserContent             dashboard_user_content.tsx     only reads the context
    getDashboardSummary(data)         dashboard_user_summary.ts      totals, allocation, earnings derived from the positions
    components/*                      receive typed props (`UserDashboardData`), no fetching
```

The whole UI depends on one type: `UserDashboardData` in `dashboard_user_type.ts`. That file is the contract.

The backend only has to provide the **positions** (`borrowPositions`, `curveLPPositions`, `susgPosition`) and the USG
price. The totals, the allocation and the earnings estimation are derived from them by the front
(`dashboard_user_summary.ts`), so the top of the page always matches the tables. `earnings` is optional: send it to
replace the estimation with real amounts.

Not connected, or nothing deposited: the page shows its grey empty states (empty gauge, empty bars, a blue "Connect
wallet" button), from an empty `UserDashboardData`.

## Plugging the backend

Replace the body of `getUserDashboardData` in `dashboard_user_repository.ts` with a call that returns a
`UserDashboardData`. Nothing else has to change.

```ts
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${address}/dashboard`)
if (!response.ok) throw new Error(`User dashboard request failed with status ${response.status}`)
return (await response.json()) as UserDashboardData
```

The backend can also send only the parts the dapp cannot compute (see "Missing") and let
`dashboard_user_adapters.ts` do the rest: every builder there is a small pure function.

Adding a new kind of position (Pendle, TAN): add its positions to the contract, a section in `SECTIONS`
(`dashboard_user_summary.ts`), a tab in `POSITION_TABS` and a panel. The allocation colors already have their keys.

Conventions of the contract: amounts are numbers in USD unless the field says otherwise, rates are in %, ratios
(`liquidationThreshold`) are between 0 and 1. Colors and icons are owned by the front.

## Where each field comes from today

| Field                                                         | Source                                                                                                                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `borrowPositions[]`                                           | `getUSGMarketsData` (on-chain view, same as the Markets page): position collateral (`positionCollateralUSDValue`), debt (`userDebt`), borrow rate, constants. Only markets where the wallet has collateral or debt |
| `borrowPositions[].health`                                    | Computed: `collateral * liquidationThreshold / debt` (same formula as the market calculator)                                                                                                                       |
| `borrowPositions[].claimableUsd`                              | `getUSGClaimOnChainData` + `getRewardTokensInfos` (same as the Claim page)                                                                                                                                         |
| `borrowPositions[].apr*`                                      | `getMarketsAprs` (API, same as the Markets page)                                                                                                                                                                   |
| `borrowPositions[].pricing`                                   | Interest rate parameters of the market (`irParams`), see "Known approximation"                                                                                                                                     |
| `susgPosition`                                                | `getUSGsUSGMetrics` (balance and price) + `getSavingsAPY`                                                                                                                                                          |
| `totalDeposited`, `totalDebt`, `totalSUSG*`, `totalClaimable` | Derived from the positions (`getDashboardSummary`)                                                                                                                                                                 |
| `allocation[]`                                                | Derived from the positions (`SECTIONS` in `dashboard_user_summary.ts`)                                                                                                                                             |
| `earnings[]`                                                  | **Estimation per day** from the APR / APY, unless the backend sends `earnings`                                                                                                                                     |
| `usgPrice`                                                    | On-chain view (`USGPrice`)                                                                                                                                                                                         |

## Claim rewards popup

The "Claim rewards" button of the Borrow Market tab opens a popup (`components/ClaimRewardsModal.tsx`): the rewards per token,
then one folding section per kind of position the wallet has with something to claim (`getClaimSections` in
`dashboard_user_claim.ts`: Borrow Market, Curve LPs Staked), each row with a switch. The borrow positions are claimed in one
transaction (same as the Claim page: `doSimpleClaim` / `doMultiClaim`, using `BorrowPosition.claimableRewards`), the
Curve LPs open their own claim page (`CurveLPPosition.claimUrl`). The data is reloaded after a claim. To add TAN
positions, add a section in `getClaimSections`.

## Missing (needs the backend / indexer)

- **Curve LPs staked** (`curveLPPositions`, `totalHeldInLPs`): the dapp has no source for the LPs staked by a wallet
  (the Earn page only lists the pools and their APR). Returned empty today.
- **Real earnings** (`earnings`): today an estimation (current deposit x current APR). Real amounts need history,
  and the tooltip "Share details" of the bars needs the reward tokens detail (`EarningLine.details`).
- **sUSG deposited**: the initial deposit is not tracked, `depositedUsd` is the current value of the balance.
- **Pendle and TAN** are not in the dapp yet, so they are not in the page.

## Known approximation

The vAPR calculator draws its curve with a simplified model of the HEC / LEC / FIR markets
(`getMarketRatesAtPrice` in `dashboard_user_calculator.ts`), fed by `BorrowPosition.pricing`. The market page uses the
exact functions (`computeIR`, `computeHECvAPR` in `record/usg_record_controller.ts`), so the two can differ a little.
To be exact, reuse those functions in `simulateVAPRCurve` and give them the raw market constants.

## Mock data

`NEXT_PUBLIC_USER_DASHBOARD_MOCK=true` in the `.env` shows `dashboard_user_mock.ts` instead of the wallet data, and
does not require a connected wallet. Useful for the design and demos. Delete the mock once the backend is plugged.

## Files

| File                           | Role                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `dashboard_user_type.ts`       | The contract (`UserDashboardData`) and the types of the page                                        |
| `dashboard_user_repository.ts` | Single entry point of the data, mock switch                                                         |
| `dashboard_user_sources.ts`    | Fetching of the raw data (each source fails on its own)                                             |
| `dashboard_user_adapters.ts`   | Pure mapping of the sources to the positions                                                        |
| `dashboard_user_summary.ts`    | Totals, allocation and earnings derived from the positions                                          |
| `dashboard_user_context.tsx`   | Loading, error and wallet state                                                                     |
| `dashboard_user_controller.ts` | UI logic: tabs, table headers, sorting, gauge, earnings periods                                     |
| `dashboard_user_claim.ts`      | Claim transaction and reward totals of the claim popup                                              |
| `dashboard_user_calculator.ts` | vAPR calculator logic and the saved simulation (shared with the market page through `localStorage`) |
| `dashboard_user_mock.ts`       | Fake data                                                                                           |
| `components/`                  | Presentational components                                                                           |
