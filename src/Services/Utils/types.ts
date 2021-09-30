export type PoolType = {
  poolAddress: string,
  title: string,
  nominal: number,
  isSuspended: boolean,
  marginTitle: string,
  positions?: DBPositionsType[]
  oracle?: {
    address: string,
    type: OracleTypeEnum
  }
}

export type DBPositionsType = {
  address: string,
  endTime: number
}

export type PositionType = {
  balance: number,
  address: string,
  endTime: number
}

export enum OracleTypeEnum {
  OPTIMISTIC = 'OPTIMISTIC',
  WITH_TIMESTAMP = 'WITH_TIMESTAMP'
}