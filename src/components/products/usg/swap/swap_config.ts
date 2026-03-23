export type SwapConfig = {
  approval: "approve" | "noApprovalNeeded"
  quote: "convertToShares" | "convertToAssets" | "1" | "enso"
  swap: "redeem" | "deposit" | "mint" | "burn" | null
  isStaked: boolean
  contract: string
  quoteContract?: string
}

export const swapConfig: { [inToken: string]: { [outToken: string]: SwapConfig } } = {
  wfrxUSD: {
    frxUSD: {
      approval: "noApprovalNeeded",
      quote: "1",
      swap: "burn",
      isStaked: false,
      contract: "wfrxUSD",
    },
    sfrxUSD: {
      approval: "noApprovalNeeded",
      quote: "convertToShares",
      quoteContract: "sfrxUSD",
      swap: "burn",
      isStaked: true,
      contract: "wfrxUSD",
    },
  },
  wcrvUSD: {
    crvUSD: {
      approval: "noApprovalNeeded",
      quote: "1",
      swap: "burn",
      isStaked: false,
      contract: "wcrvUSD",
    },
    scrvUSD: {
      approval: "noApprovalNeeded",
      quote: "convertToShares",
      quoteContract: "scrvUSD",
      swap: "burn",
      isStaked: true,
      contract: "wcrvUSD",
    },
  },
  wUSDe: {
    USDe: {
      approval: "noApprovalNeeded",
      quote: "1",
      swap: "burn",
      isStaked: false,
      contract: "wUSDe",
    },
    sUSDe: {
      approval: "noApprovalNeeded",
      quote: "convertToShares",
      quoteContract: "sUSDe",
      swap: "burn",
      isStaked: true,
      contract: "wUSDe",
    },
  },
  wDOLA: {
    DOLA: {
      approval: "noApprovalNeeded",
      quote: "1",
      swap: "burn",
      isStaked: false,
      contract: "wDOLA",
    },
    sDOLA: {
      approval: "noApprovalNeeded",
      quote: "convertToShares",
      quoteContract: "sDOLA",
      swap: "burn",
      isStaked: true,
      contract: "wDOLA",
    },
  },

  USG: {
    sUSG: {
      approval: "approve",
      quote: "convertToShares",
      quoteContract: "sUSG",
      swap: "deposit",
      isStaked: true,
      contract: "sUSG",
    },
  },
  frxUSD: {
    wfrxUSD: {
      approval: "approve",
      quote: "1",
      swap: "mint",
      isStaked: false,
      contract: "wfrxUSD",
    },
  },
  crvUSD: {
    wcrvUSD: {
      approval: "approve",
      quote: "1",
      swap: "mint",
      isStaked: false,
      contract: "wcrvUSD",
    },
  },
  USDe: {
    wUSDe: {
      approval: "approve",
      quote: "1",
      swap: "mint",
      isStaked: false,
      contract: "wUSDe",
    },
  },
  DOLA: {
    wDOLA: {
      approval: "approve",
      quote: "1",
      swap: "mint",
      isStaked: false,
      contract: "wDOLA",
    },
  },

  sUSG: {
    USG: {
      approval: "noApprovalNeeded",
      quote: "convertToAssets",
      quoteContract: "sUSG",
      swap: "redeem",
      isStaked: true,
      contract: "sUSG",
    },
  },
  sfrxUSD: {
    wfrxUSD: {
      approval: "approve",
      quote: "convertToAssets",
      quoteContract: "sfrxUSD",
      swap: "mint",
      isStaked: true,
      contract: "wfrxUSD",
    },
  },
  scrvUSD: {
    wcrvUSD: {
      approval: "approve",
      quote: "convertToAssets",
      quoteContract: "scrvUSD",
      swap: "mint",
      isStaked: true,
      contract: "wcrvUSD",
    },
  },
  sUSDe: {
    wUSDe: {
      approval: "approve",
      quote: "convertToAssets",
      quoteContract: "sUSDe",
      swap: "mint",
      isStaked: true,
      contract: "wUSDe",
    },
  },
  sDOLA: {
    wDOLA: {
      approval: "approve",
      quote: "convertToAssets",
      quoteContract: "sDOLA",
      swap: "mint",
      isStaked: true,
      contract: "wDOLA",
    },
  },
}
