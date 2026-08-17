import { FormError } from "@/components/products/usg/usg_type"

export const dappErrors = {
  // — Generic
  "no-wallet": {
    key: "no-wallet",
    title: "No Connected Wallet",
    subtitle: "You need to connect your wallet to proceed.",
    content: "Please connect your wallet to continue.",
    type: null,
  },
  "empty-form": {
    key: "empty-form",
    title: "Input Value missing",
    subtitle: "Please enter an amount.",
    content: "A value greater than zero is required to proceed.",
    type: "form-alert",
  },
  balance: {
    key: "balance",
    title: "Insufficient Balance",
    subtitle: "You don't have enough tokens to complete this transaction.",
    content: "Please reduce your amount or acquire more tokens.",
    type: "form-alert",
  },
  "price-impact": {
    key: "price-impact",
    title: "Price Impact Too High",
    subtitle: "The quoted value deviates significantly from your deposit.",
    type: null,
  },
  slippage: {
    key: "slippage",
    title: "Slippage Too High",
    subtitle: "Your slippage tolerance is blocking this transaction.",
    content: "Please lower your slippage to proceed.",
    type: null,
  },
  // — Borrow / Repay
  "max-ltv": {
    key: "max-ltv",
    title: "Loan Exceeds Max LTV",
    subtitle: "Your borrow amount exceeds the maximum loan-to-value ratio.",
    content: "Please reduce your borrow amount to stay within the allowed LTV.",
    type: "form-alert",
  },
  "max-market-debt": {
    key: "max-market-debt",
    title: "Max Market Debt Reached",
    subtitle: "This borrow would exceed the market's maximum debt limit.",
    content: "Please reduce your borrow amount.",
    type: "form-alert",
  },
  "repay-exceeds-debt": {
    key: "repay-exceeds-debt",
    title: "Repayment Exceeds Debt",
    subtitle: "Your repayment amount is greater than your outstanding debt.",
    content: "Please reduce your repayment amount.",
    type: "form-alert",
  },
  // — Cap / Withdraw
  "cap-exceeded": {
    key: "cap-exceeded",
    title: "Deposit Cap Reached",
    subtitle: "This deposit would exceed the maximum allowed amount.",
    content: "The pool has reached its capacity. Please reduce your deposit amount.",
    type: "form-alert",
  },
  "max-withdrawable": {
    key: "max-withdrawable",
    title: "Amount Exceeds Maximum",
    subtitle: "Your withdrawal amount is greater than the maximum withdrawable.",
    content: "Please reduce your withdrawal amount.",
    type: "form-alert",
  },
  // — Lock
  "lock-expired": {
    key: "lock-expired",
    title: "Lock Expired",
    subtitle: "Your lock period has ended.",
    content: "This position can no longer be used as the lock has expired.",
    type: "form-alert",
  },
  "min-lock": {
    key: "min-lock",
    title: "Minimum Lock Not Reached",
    // Overridden at runtime with the amount read from vsTAN.minLock()
    subtitle: "This amount is below the minimum required to create a new position.",
    content: "Increase your amount, or add it to one of your existing positions instead.",
    type: "form-alert",
  },
  "same-position": {
    key: "same-position",
    title: "Invalid Merge",
    subtitle: "You cannot merge a position with itself.",
    content: "Please select two different positions to merge.",
    type: "form-alert",
  },
  "duplicate-position": {
    key: "duplicate-position",
    title: "Duplicate Position",
    subtitle: "The same position is selected more than once.",
    content: "Remove the duplicate to continue.",
    type: "form-alert",
  },
  "nothing-to-claim": {
    key: "nothing-to-claim",
    title: "Nothing To Claim",
    subtitle: "The selected positions have no rewards accrued.",
    content: "Rewards stream over each 7-day epoch — select a position with a claimable balance.",
    type: "form-alert",
  },
  "no-position-selected": {
    key: "no-position-selected",
    title: "No Position Selected",
    subtitle: "Select a vsTAN position to continue.",
    content: "Choose one of your positions from the selector above.",
    type: "form-alert",
  },
  // — Leverage
  "max-leverage": {
    key: "max-leverage",
    title: "Leverage Too High",
    subtitle: "Your leverage exceeds the maximum allowed for this market.",
    content: "Please reduce your leverage to proceed.",
    type: "form-alert",
  },
  "low-max-leverage": {
    key: "low-max-leverage",
    title: "Deposit Too Large",
    subtitle: "Your deposit exceeds the market's remaining borrow capacity.",
    content: "Please reduce your deposit amount to access leverage.",
    type: "form-alert",
  },
  // — Zap
  "no-zap-value": {
    key: "no-zap-value",
    title: "No Zap Value",
    subtitle: "The zap quote hasn't loaded yet.",
    content: "Please wait for the zap value to be calculated before proceeding.",
    type: "form-alert",
  },
  "wallet-repay": {
    key: "wallet-repay",
    title: "Repayment Uses Wallet USG",
    subtitle: "This repayment will use USG from your wallet.",
    content: "Make sure you have enough USG in your wallet to cover the repayment.",
    type: null,
  },
} satisfies Record<string, FormError>
