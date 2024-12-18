import { BoosterStakingInfos } from "./booster_type"
import { Address } from "viem"

export const boosterStakingInfos: BoosterStakingInfos = {
  // TODO use constant
  BAL: {
    stakingAddress: "0xAf5b3f4A0b4dc334dB7137E5584E0e971E5e4962",
    asset: "BAL",
    sdAsset: "sdBAL",
    gaugeAsset: "0x3E8C72655e48591d93e6dfdA16823dB0fF23d859",
    pool: undefined,
    rewards: ["BAL", "USDC", "sdBAL", "SDT", "BAL80"],
  },
  CRV: {
    stakingAddress: "0x2FF160bcADb485b5F048b9880e6f471Af632060c",
    asset: "CRV",
    sdAsset: "sdCRV",
    gaugeAsset: "0x7f50786A0b15723D741727882ee99a0BF34e3466",
    pool: "0xca0253a98d16e9c1e3614cafda19318ee69772d0",
    rewards: ["CRVUSD", "CRV", "sdCRV", "SDT", "TRICRV"],
  },
  PENDLE: {
    stakingAddress: "0x508f0E1b565b40AeB94671BeD228083203330882",
    asset: "PENDLE",
    sdAsset: "sdPENDLE",
    gaugeAsset: "0x5Ea630e00D6eE438d3deA1556A110359ACdc10A9",
    pool: "0x26f3f26f46cbee59d1f8860865e13aa39e36a8c0",
    rewards: ["PENDLE", "WETH", "sdPENDLE", "SDT"],
  },
  FXN: {
    stakingAddress: "0x35e30Bc815935Bb5EC1743f772331864D780cc26",
    asset: "FXN",
    sdAsset: "sdFXN",
    gaugeAsset: "0xbcfE5c47129253C6B8a9A00565B3358b488D42E0",
    pool: "0x28ca243dc0ac075dd012fcf9375c25d18a844d96",
    rewards: ["wstETH", "SDT", "sdFXN"],
  },
}

export const BOOSTER_CONTRACT = {
  SDT_UTILITIES: "0xD861Ff854206d0Db64f1C0f3108f59576A5CCc04" as Address,
  BLACK_HOLE: "0x21777106355Ba506A31FF7984c0aE5C924deB77f" as Address,
  REWARD_DISTRIBUTOR: "0x6B65525a40704a4c48d07c25b8D05654854DFEcD" as Address,
}
