export type PoolType = {
  poolAddress: string,
  title: string,
  nominal: number,
  isSuspended: boolean,
  oracle?: {
    address: string,
    type: OracleTypeEnum
  }
}

export type PositionType = {
  balance: number,
  address: string,
  blockNumber: number,
  endTime: number
}

export enum OracleTypeEnum {
  OPTIMISTIC = 'OPTIMISTIC',
  WITH_TIMESTAMP = 'WITH_TIMESTAMP'
}