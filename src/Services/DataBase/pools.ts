import { OracleTypeEnum } from '../Utils/types'

// Polygon positions
import {positions as realt10700Whittier} from './positions/polygon/realt10700Whittier'
import {positions as realt402Kostner} from './positions/polygon/realt402Kostner'


export const ethPools = []

export const bscPools = []

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
  }
]