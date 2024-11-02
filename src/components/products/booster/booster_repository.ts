import { TOKEN_ADDR } from "@/services/repo_asset_addresses"

import { BoosterStakingInfos } from "./booster_type"

export const boosterStakingInfos: BoosterStakingInfos = {
  BAL: {
    stakingAddress: "0xAf5b3f4A0b4dc334dB7137E5584E0e971E5e4962",
    asset: TOKEN_ADDR.BAL,
    sdAsset: "0xF24d8651578a55b0C119B9910759a351A3458895",
    gaugeAsset: "0x3E8C72655e48591d93e6dfdA16823dB0fF23d859",
    pool: undefined,
  },
  CRV: {
    stakingAddress: "0x2FF160bcADb485b5F048b9880e6f471Af632060c",
    asset: TOKEN_ADDR.CRV,
    sdAsset: "0xD1b5651E55D4CeeD36251c61c50C889B36F6abB5",
    gaugeAsset: "0x7f50786A0b15723D741727882ee99a0BF34e3466",
    pool: "0xca0253a98d16e9c1e3614cafda19318ee69772d0",
  },
  PENDLE: {
    stakingAddress: "0x508f0E1b565b40AeB94671BeD228083203330882",
    asset: TOKEN_ADDR.PENDLE,
    sdAsset: "0x5Ea630e00D6eE438d3deA1556A110359ACdc10A9",
    gaugeAsset: "0x50DC9aE51f78C593d4138263da7088A973b8184E",
    pool: "0x26f3f26f46cbee59d1f8860865e13aa39e36a8c0",
  },
  FXN: {
    stakingAddress: "0x35e30Bc815935Bb5EC1743f772331864D780cc26",
    asset: TOKEN_ADDR.FXN,
    sdAsset: "0xe19d1c837B8A1C83A56cD9165b2c0256D39653aD",
    gaugeAsset: "0xbcfE5c47129253C6B8a9A00565B3358b488D42E0",
    pool: "0x28ca243dc0ac075dd012fcf9375c25d18a844d96",
  },
}
