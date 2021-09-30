import { OracleTypeEnum } from '../Utils/types'

// ETH positions
import {positions as opiumOptionCall} from './positions/eth/opiumOptionCall'
import {positions as usdtProtection} from './positions/eth/usdtProtection'

// BSC positions
import {positions as turboETH} from './positions/bsc/turboETH'

// Polygon positions
import {positions as ETHDumpProtection} from './positions/polygon/ETHDumpProtection'
import {positions as realt10700Whittier} from './positions/polygon/realt10700Whittier'
import {positions as realt402Kostner} from './positions/polygon/realt402Kostner'
import {positions as turboAAVE} from './positions/polygon/turboAAVE'
import {positions as turboBTC} from './positions/polygon/turboBTC'
import {positions as turboDailyETH} from './positions/polygon/turboDailyETH'
import {positions as turboWeeklyETH} from './positions/polygon/turboWeeklyETH'
import {positions as turboMATIC} from './positions/polygon/turboMATIC'


export const ethPools = [
  {
    title: 'USDT Protection',
    poolAddress: '0x5afFE41805a9E57fEd3657d0e64D96aeA0B77885',
    nominal: 1,
    isSuspended: false,
    marginTitle: 'USDC',
    positions: usdtProtection,
    oracle: {
      address: '0x89c9c6731817ce9d3f52dc96e1481086bc1b328c',
      type: OracleTypeEnum.WITH_TIMESTAMP
    }
  },
  {
    title: '$OPIUM Option Call',
    poolAddress: '0xc1650f389de9056636d968832eb63382e3970fa1',
    nominal: 1,
    isSuspended: false,
    marginTitle: 'OPIUM',
    positions: opiumOptionCall,
    oracle: {
      address: '0x64dcb00e36a6238dad28e59c71c5214500539ef7',
      type: OracleTypeEnum.OPTIMISTIC
    }
  },
  {
    title: '(OLD) USDT Protection 05 MAR',
    poolAddress: '0x527bc50b075a65b7e17ae8606a1adeb08bceb971',
    nominal: 1,
    isSuspended: true,
    marginTitle: 'USDC',
  },
  {
    title: '(OLD) USDT Protection 13 MAR',
    poolAddress: '0x39787f0aedb73eeee6ceb0b22ef9293a3f3df5af',
    nominal: 1,
    isSuspended: true,
    marginTitle: 'USDC',
  },
  {
    title: '(OLD) USDT Protection 19 MAR',
    poolAddress: '0xf5cb774e890edf3979bf9ae7a1c098ee89429ce5',
    nominal: 1,
    isSuspended: true,
    marginTitle: 'USDC',
  },
  {
    title: '(OLD) USDT Protection 26 MAR',
    poolAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    nominal: 1,
    isSuspended: true,
    marginTitle: 'USDC',
  },
  {
    title: '(OLD) SpaceX Rideshare Insurance',
    poolAddress: '0xbD0375A06Afd5C3A0A0AD26F30c4B37629F00D8e',
    nominal: 1,
    isSuspended: true,
    marginTitle: 'USDC',
  },
  {
    title: '(OLD) Matic Bridge Protection',
    poolAddress: '0xb54539D39529cE58fB63877DEbC6d6b70E3ecA01',
    nominal: 1,
    isSuspended: true,
    marginTitle: 'USDT',
  },
  {
    title: '(OLD) xDAI OmniBridge Protection',
    poolAddress: '0x0cAb5A7dCAb521aF5404Fa604b85113267d38444',
    nominal: 1,
    isSuspended: true,
    marginTitle: 'USDC',
  },  
]

export const bscPools = [
  {
    title: 'Turbo ETH',
    poolAddress: '0xbb0E1AC2Fa9A4785D0894990B5c18A6Ea3dAD846',
    nominal: 0.001,
    isSuspended: false,
    marginTitle: 'ETH',
    positions: turboETH,
    oracle: {
      address: '0xf5D690c9D61092112660FEAf62e542a670Fa886D',
      type: OracleTypeEnum.WITH_TIMESTAMP
    }
  }
]

export const polygonPools = [
  {
    title: 'RealT 10700 Whittier Rent insurance',
    poolAddress: '0xA4fe26FcA5F20F6c4e691EF60AD55712b6B26348',
    nominal: 1,
    isSuspended: false,
    marginTitle: 'USDC',
    positions: realt10700Whittier,
    oracle: {
      address: '0x8E6CAF617718c5Ee21c2d583FAbEbecFb52cbd9c',
      type: OracleTypeEnum.OPTIMISTIC
    }
  },
  {
    title: 'RealT 402 S Kostner Rent insurance',
    poolAddress: '0x37baa047B4C062A2CB93fC6550011f72E36a3894',
    nominal: 1,
    isSuspended: false,
    marginTitle: 'USDC',
    positions: realt402Kostner,
    oracle: {
      address: '0x335d0bc9311d6c4b5dce51dbff1eb2bbf04ce8da',
      type: OracleTypeEnum.OPTIMISTIC
    }
  },
  {
    title: 'ETH Dump Protection',
    poolAddress: '0xB3e0a40F6dFA981099879F8076B1A46C59dFe597',
    nominal: 1,
    isSuspended: false,
    marginTitle: 'USDC',
    positions: ETHDumpProtection,
    oracle: {
      address: '0x0D876632F321fdcAbC540eEA5867c4799A627ed8',
      type: OracleTypeEnum.WITH_TIMESTAMP
    }
  },
  {
    title: 'Weekly Turbo ETH',
    poolAddress: '0x020B49AE5C5f805895d4Cb0ed91236BE4345c825',
    nominal: 0.01,
    isSuspended: false,
    marginTitle: 'WETH',
    positions: turboWeeklyETH,
    oracle: {
      address: '0x0D876632F321fdcAbC540eEA5867c4799A627ed8',
      type: OracleTypeEnum.WITH_TIMESTAMP
    }
  },
  {
    title: 'Turbo BTC',
    poolAddress: '0x5C1E6bc8E52cE1a262014c743508f74923a5B0d2',
    nominal: 0.001,
    isSuspended: false,
    marginTitle: 'WBTC',
    positions: turboBTC,
    oracle: {
      address: '0xf5cb774e890edf3979bf9ae7a1c098ee89429ce5',
      type: OracleTypeEnum.WITH_TIMESTAMP
    }
  },
  {
    title: 'Turbo MATIC',
    poolAddress: '0xC1e31C2db9f238809FE58089a7Fa7cE5aA7E52c6',
    nominal: 10,
    isSuspended: false,
    marginTitle: 'WMATIC',
    positions: turboMATIC,
    oracle: {
      address: '0x2e9ac4d0882165dce317f23925060ca3551782a9',
      type: OracleTypeEnum.WITH_TIMESTAMP
    }
  },
  {
    title: 'Turbo AAVE',
    poolAddress: '0x2300091326DF68309BDB7eE885de561C2C89fea9',
    nominal: 0.001,
    isSuspended: false,
    marginTitle: 'amAAVE',
    positions: turboAAVE,
    oracle: {
      address: '0xbE457663218C3527A82d4021b1DCE5802997063b',
      type: OracleTypeEnum.WITH_TIMESTAMP
    }
  },
  {
    title: 'Daily Turbo ETH',
    poolAddress: '0xf5D690c9D61092112660FEAf62e542a670Fa886D',
    nominal: 0.001,
    isSuspended: false,
    marginTitle: 'WETH',
    positions: turboDailyETH,
    oracle: {
      address: '0x0D876632F321fdcAbC540eEA5867c4799A627ed8',
      type: OracleTypeEnum.WITH_TIMESTAMP
    }
  }
]