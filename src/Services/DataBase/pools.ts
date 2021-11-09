import { OracleTypeEnum } from '../Utils/types'

// Polygon positions
import {positions as realt10700Whittier} from './positions/polygon/realt10700Whittier'
import {positions as realt402Kostner} from './positions/polygon/realt402Kostner'


export const ethPools = []

export const bscPools = []

export const polygonPools = [
  {
    title: 'RealT 2661-2663 Cortland Rent insurance',
    poolAddress: '0x20120864944fC47fed4821C1c4B1b6a7D400844b',
    nominal: 1,
    marginTitle: 'USDC',
    isSuspended: false,
    oracle: {
      address: '0x739de5bea03346dee2c402f0499409f43b78cd3c',
      type: OracleTypeEnum.OPTIMISTIC
    }
  },
  {
    title: 'RealT 20160 Conant Rent insurance',
    poolAddress: '0xCd9955ba381e408575Acca4F712573c5f6e4b174',
    nominal: 1,
    marginTitle: 'USDC',
    isSuspended: false,
    oracle: {
      address: '0x614fc2a2d689b38f8f711f300ce1f924fa230513',
      type: OracleTypeEnum.OPTIMISTIC
    }
  },
  {
    title: 'RealT 5517-5519 Elmhurst Rent insurance',
    poolAddress: '0xcd465bedccBF1Bd89998757563f4A3b3D6bb01B6',
    nominal: 1,
    marginTitle: 'USDC',
    isSuspended: false,
    oracle: {
      address: '0x0e6ab9aeaa60778ab6758dd094ef2e12cb301f14',
      type: OracleTypeEnum.OPTIMISTIC
    }
  },
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