type TokenInfo = {
  info: string
  website: string
  docs: string
}

export const TOKEN_INFOS: Record<string, TokenInfo> = {
  USDC: {
    info: "USDC is a fiat-redeemable stablecoin issued by Circle. USDC is backed by short-term U.S. Treasury bonds and other cash-equivalent reserves.",
    website: "https://www.circle.com/usdc",
    docs: "https://www.circle.com/transparency",
  },
  USDT: {
    info: "USDT is a fiat-redeemable stablecoin issued by Tether. USDT is backed by short-term U.S. Treasury bonds, cash-equivalent reserves, precious metals, Bitcoin, and secured loans.",
    website: "https://tether.to",
    docs: "https://tether.to/en/transparency/?tab=reports",
  },
  frxUSD: {
    info: "frxUSD is a fiat-redeemable stablecoin issued by Frax. frxUSD is backed by tokenized short-term U.S. Treasury bonds.",
    website: "https://frax.com",
    docs: "https://docs.frax.finance",
  },
  PYUSD: {
    info: "PYUSD is a fiat-redeemable stablecoin issued by Paypal. PYUSD is backed by short-term U.S. Treasury bonds and other cash-equivalent reserves.",
    website: "https://www.paypal.com/us/digital-wallet/manage-money/crypto/pyusd",
    docs: "https://www.paypal.com/us/digital-wallet/manage-money/crypto/pyusd",
  },
  RLUSD: {
    info: "RLUSD is a fiat-redeemable stablecoin issued by Ripple. RLUSD is backed by cash and other cash-equivalent reserves.",
    website: "https://ripple.com/solutions/stablecoin/",
    docs: "https://ripple.com/solutions/stablecoin/",
  },
  USDe: {
    info: "USDe is a synthetic stablecoin backed by a mix of stablecoins, U.S. Treasury bonds, and basis-trade strategies. USDe is issued by Ethena.",
    website: "https://ethena.fi",
    docs: "https://docs.ethena.fi/",
  },
  sUSDe: {
    info: "sUSDe is the savings version of USDe, a synthetic stablecoin issued by Ethena. USDe is backed by a mix of stablecoins, U.S. Treasury bonds, and basis-trade strategies.",
    website: "https://ethena.fi",
    docs: "https://docs.ethena.fi/",
  },
  crvUSD: {
    info: "crvUSD is a CDP stablecoin issued by Curve. crvUSD is overcollateralized with crypto assets.",
    website: "https://curve.fi",
    docs: "https://resources.curve.finance/crvusd/overview/",
  },
  GHO: {
    info: "GHO is a CDP stablecoin issued by AAVE. GHO is overcollateralized with crypto assets.",
    website: "https://aave.com/gho",
    docs: "https://docs.aave.com/developers/whats-gho/about-gho",
  },
  fxUSD: {
    info: "fxUSD is a CDP stablecoin issued by Protocol f(x). fxUSD is overcollateralized with crypto assets.",
    website: "https://fx.aladdin.club/",
    docs: "https://fx.aladdin.club/",
  },
  reUSD: {
    info: "reUSD is a CDP stablecoin issued by Resupply. reUSD is overcollateralized with crvUSD and frxUSD deposited in lending markets.",
    website: "https://resupply.fi/",
    docs: "https://resupply.fi/",
  },
  USDS: {
    info: "USDS is a stablecoin issued by Sky. USDS is collateralized with crypto assets and RWAs.",
    website: "https://sky.money/",
    docs: "https://sky.money/",
  },
  sUSDS: {
    info: "sUSDS is the savings version of USDS, a stablecoin issued by Sky. USDS is collateralized with onchain collateral and RWAs.",
    website: "https://sky.money/",
    docs: "https://sky.money/",
  },
  DOLA: {
    info: "DOLA is a CDP stablecoin issued by Inverse Finance. DOLA is overcollateralized with crypto assets.",
    website: "https://www.inversefinance.xyz/",
    docs: "https://docs.inverse.finance/",
  },
  sDOLA: {
    info: "sDOLA is the savings version of DOLA, a CDP stablecoin issued by Inverse Finance. DOLA is overcollateralized with crypto assets.",
    website: "https://www.inversefinance.xyz/",
    docs: "https://docs.inverse.finance/",
  },
  OUSD: {
    info: "OUSD is backed by USDC deposits into Morpho vaults. OUSD is issued by Origin.",
    website: "https://originprotocol.com/",
    docs: "https://docs.ousd.com/",
  },
  eUSD: {
    info: "eUSD is backed by major stablecoin deposits into lending protocols such as AAVE and Compound. eUSD is issued by Reserve Protocol.",
    website: "https://app.reserve.org/",
    docs: "https://docs.reserve.org/",
  },
  scrvUSD: {
    info: "scrvUSD is the savings version of crvUSD, a CDP stablecoin issued by Curve. crvUSD is overcollateralized with crypto assets.",
    website: "https://curve.fi",
    docs: "https://resources.curve.finance/crvusd/overview/",
  },
  BOLD: {
    info: "BOLD is an immutable CDP stablecoin issued by Liquity. BOLD is overcollateralized with ETH, wstETH, and rETH.",
    website: "https://liquity.org/",
    docs: "https://docs.liquity.org/",
  },
  msUSD: {
    info: "msUSD is a CDP stablecoin issued by Metronome. msUSD is overcollateralized with crypto assets.",
    website: "https://metronome.io/",
    docs: "https://docs.metronome.io/",
  },
  WETH: {
    info: "WETH is ETH wrapped as an ERC20.",
    website: "https://ethereum.org/wrapped-eth/",
    docs: "https://ethereum.org/wrapped-eth/",
  },
  "ETH+": {
    info: "ETH+ is an LST-aggregator issued by Reserve. ETH+ is backed by other ETH LSTs.",
    website: "https://app.reserve.org/ethereum/token/0xe72b141df173b999ae7c1adcbf60cc9833ce56a8/overview",
    docs: "https://app.reserve.org/ethereum/token/0xe72b141df173b999ae7c1adcbf60cc9833ce56a8/overview",
  },
  tBTC: {
    info: "tBTC is a tokenized version of BTC on Ethereum issued by Threshold Network. tBTC is backed 1:1 by BTC.",
    website: "https://www.threshold.network/",
    docs: "https://www.threshold.network/",
  },
  cbBTC: {
    info: "cbBTC is a tokenized version of BTC on Ethereum issued by Coinbase. cbBTC is backed 1:1 by BTC.",
    website: "https://www.coinbase.com/fr-fr/cbbtc",
    docs: "https://www.coinbase.com/fr-fr/cbbtc",
  },
  PAXG: {
    info: "PAXG is a tokenized version of an ounce of Gold on Ethereum issued by Paxos. Each PAXG is backed by a physical ounce of Gold.",
    website: "https://www.paxos.com/pax-gold",
    docs: "https://www.paxos.com/pax-gold",
  },
  XAUt: {
    info: "XAUt is a tokenized version of an ounce of Gold on Ethereum issued by Tether. Each XAUt is backed by a physical ounce of Gold.",
    website: "https://gold.tether.to/",
    docs: "https://gold.tether.to/",
  },
  msETH: {
    info: "msETH is a CDP ETH stablecoin issued by Metronome DAO. msETH is overcollateralized with crypto assets.",
    website: "https://metronome.io/",
    docs: "https://docs.metronome.io/",
  },
  OETH: {
    info: "OETH is an ETH LST issued by Origin Protocol.",
    website: "https://www.originprotocol.com/",
    docs: "https://docs.originprotocol.com/",
  },
}
