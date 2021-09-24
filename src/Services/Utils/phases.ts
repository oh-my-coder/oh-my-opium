export const getPhase = (epochLength: number, stakingPhaseLength: number, tradingPhaseLength: number, endTime: number) => {
  const now = Number((Date.now() / 1000).toFixed())

  const tradingStart = endTime - epochLength + stakingPhaseLength
  const tradingEnd = tradingStart + tradingPhaseLength
  const stakingStart = endTime - epochLength
  const stakingEnd = tradingStart
  const notInitializedStart = tradingEnd
  const notInitializedEnd = endTime

  const isTrading = (tradingStart < now) && (tradingEnd > now)
  const isStaking = (stakingStart < now) && (stakingEnd > now)
  const isNotInitialized = !isStaking && !isTrading

  const currentPhaseText = isTrading ? 'TRADING' : isStaking ? 'REBALANCING' : 'NOT INITIALIZED'


  
  return {
    isStaking, isTrading, isNotInitialized, currentPhaseText, 
    tradingStart, tradingEnd, stakingStart, stakingEnd, notInitializedStart, notInitializedEnd
  }
}