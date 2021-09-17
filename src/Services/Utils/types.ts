export type PoolType = {
  poolAddress: string,
  title: string,
  nominal: number,
  isSuspended: boolean
}

export type PositionType = {
  balance: number,
  address: string,
  blockNumber: number,
  endTime: number
}