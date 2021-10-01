export const getPhase = (epochLength: number, stakingPhaseLength: number, tradingPhaseLength: number, endTime: number, idleStakingTimeLimit: number) => {
  const now = Number((Date.now() / 1000).toFixed())

  const tradingStart = endTime - epochLength + stakingPhaseLength
  const tradingEnd = tradingStart + tradingPhaseLength
  const stakingStart = endTime - epochLength
  const stakingEnd = tradingStart
  const notInitializedStart = endTime - idleStakingTimeLimit
  const notInitializedEnd = endTime
  const stakingOnlyStart = tradingEnd
  const stakingOnlyEnd = notInitializedStart

  const isTrading = (tradingStart < now) && (tradingEnd > now)
  const isStaking = (stakingStart < now) && (stakingEnd > now)
  const isNotInitialized = !isStaking && !isTrading
  const isStakingOnly = isNotInitialized && (now < endTime - idleStakingTimeLimit)

  const currentPhaseText = isTrading ? 'TRADING' : isStaking ? 'REBALANCING' : isStakingOnly ? 'STAKING (ONLY)' : 'WAITING'
  
  return {
    isStaking, isTrading, isNotInitialized, isStakingOnly, currentPhaseText, 
    tradingStart, tradingEnd, stakingStart, stakingEnd, notInitializedStart, notInitializedEnd,
    stakingOnlyStart, stakingOnlyEnd
  }
}