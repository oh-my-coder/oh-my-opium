import { 
  createStakingContractInstance,
  createReadOnlyStakingContractInstance,
  createTokenContractInstance,
  createOpiumIERC20PositionContractInstance,
  createOracleWithCallbackContractInstance
} from './contract'
import { convertFromBN, convertToBN } from './bn'
import { sendTx, fetchTheGraph } from './transaction'
import { PoolType, PositionType } from './types'
import { getPhase } from './phases'
import { convertDateFromTimestamp } from './date'
import { lastBlockByNetwork, subgraphs } from './constants'
import authStore from '../Stores/AuthStore'
const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'


export const makeApprove = async (
  poolAddress: string, 
  userAddress: string, 
  onConfirm: () => void, 
  onError: (error: Error) => void,
  marginAddress?: string
): Promise<string> => {

  // Create contracts instances 
  const stakingContract = createStakingContractInstance(poolAddress)
  const tokenAddress =  marginAddress || await stakingContract?.methods.underlying().call()
  const tokenContract = createTokenContractInstance(tokenAddress)

  // Make allowance 
  const tx = tokenContract?.methods.approve(poolAddress, MAX_UINT256).send({ from: userAddress })
  return await sendTx(tx, onConfirm, onError)
}


export const checkTokenBalance = async (
  poolAddress: string,
  userAddress: string,
  value: number
) => {
  try {
    const stakingContract = createStakingContractInstance(poolAddress)
    const decimals = await stakingContract?.methods.decimals().call()
    const tokenAddress =  await stakingContract?.methods.underlying().call()
    const tokenContract = createTokenContractInstance(tokenAddress)
    const balanceBN = await tokenContract?.methods.balanceOf(userAddress).call()
    const balance = +convertFromBN(balanceBN, decimals)
    return value > balance
  } catch (e) {
    console.log(e)
    return true
  }
}

export const checkStakedBalance = async (
  poolAddress: string,
  userAddress: string,
  value: number
) => {
  try {
    const stakingContract = createStakingContractInstance(poolAddress)
    const shares = await stakingContract?.methods.balanceOf(userAddress).call()
    const balanceBN = await stakingContract?.methods.calculateSharesToUnderlyingRatio(shares).call()
    const decimals = await stakingContract?.methods.decimals().call()
    const balance = +convertFromBN(balanceBN, +decimals)
    return value > balance
  } catch (e) {
    console.log(e)
    return true
  }
}

export const getAllowance = async (tokenAddress: string, userAddress: string, poolAddress: string) => {
  const tokenContract = createTokenContractInstance(tokenAddress)

  const allowance = await tokenContract?.methods.allowance(userAddress, poolAddress).call()
  return allowance
}


export const checkAllowance = async (
  value: number,
  poolAddress: string, 
  userAddress: string,
) => {

  // Create contracts instances 
  const stakingContract = createStakingContractInstance(poolAddress)
  const tokenAddress = await stakingContract?.methods.underlying().call({from: userAddress})

  // Check allowance
  const allowance = await getAllowance(tokenAddress, userAddress, poolAddress).then((allowance: string) => {
    return stakingContract?.methods.decimals().call().then((decimals: string) => {
      return +convertFromBN(allowance, +decimals)
    })
  })
  return allowance > value 
}

export const stakeIntoPool = async (
  value: number,
  poolAddress: string, 
  userAddress: string, 
  onConfirm: () => void, 
  onError: (error: Error) => void
) => {
  // Create contracts instances 
  const stakingContract = createStakingContractInstance(poolAddress)

  // Create deposit tx
  const decimals = await stakingContract?.methods.decimals().call()
  const tx = stakingContract?.methods.deposit(convertToBN(value, +decimals)).send({ from: userAddress })

  // Send tx
  return await sendTx(tx, onConfirm, onError)
}

export const unstakeFromPool = async (
  value: number,
  poolAddress: string, 
  userAddress: string, 
  onConfirm: () => void, 
  onError: (error: Error) => void
) => {
  // Create contracts instances 
  const stakingContract = createStakingContractInstance(poolAddress)

  // Create withdrawal tx
  const decimals = await stakingContract?.methods.decimals().call()
  const tx = stakingContract?.methods.withdraw(convertToBN(value, +decimals)).send({ from: userAddress })

  // Send tx
  return await sendTx(tx, onConfirm, onError)
}

export const buyProduct = async (
  value: number,
  pool: PoolType,
  userAddress: string, 
  onConfirm: () => void, 
  onError: (error: Error) => void,
  onInsufficientLiquidity: () => void
) => {
  const { poolAddress, nominal } = pool

  // Create contracts instances 
  const stakingContract = createStakingContractInstance(poolAddress)

  // Calculate metadata
  const decimals = await stakingContract?.methods.decimals().call()
  const quantity = Math.floor(value/nominal)

  const premium = await getPremium(value, pool)

  if (!premium) return onInsufficientLiquidity()

  // Send tx
  const tx = stakingContract?.methods.hedge(
    quantity,
    convertToBN(premium * 1.05, decimals)).send({ from: userAddress })
  return await sendTx(tx, onConfirm, onError)
}


export const getPremium = async (
  value: number,
  pool: PoolType,
) => {
  const { poolAddress, nominal } = pool
  let premium
  const stakingContract = createStakingContractInstance(poolAddress)

  const quantity = Math.floor(value / nominal)
  const { availableQuantity } = await stakingContract?.methods.getAvailableQuantity().call()

  if (quantity > +availableQuantity) {
    return premium
  }

  const decimals = await stakingContract?.methods.decimals().call()
  const premiumBN = await stakingContract?.methods.getRequiredPremium(quantity).call()
  premium = +convertFromBN(premiumBN, decimals)
  return premium
}

export const getInsurancePrice = async(
  value: number,
  pool: PoolType
) => {

  const { nominal } = pool

  const premium = await getPremium(value, pool)
  if (!premium) return 0

  const quantity = Math.floor(value / nominal)

  return quantity * premium
}

export const getPurchasedProducts = async (
  pool: PoolType,
  userAddress: string,
  onError: (error: any) => void,
  ) => {

  const { poolAddress, positions: dbPositions} = pool
  const decimals = 18
  const web3 = authStore.blockchain.getWeb3()
  if (!web3) return

  // Create contracts instance
  const stakingContractReadOnly = createReadOnlyStakingContractInstance(poolAddress)
  const stakingContract = createStakingContractInstance(poolAddress)

  
  const positions: PositionType[] = []

  // Get positions from DB
  if (dbPositions) {
    for (let pos of dbPositions) {
      const { endTime, address } = pos
      const wrapperContract = createTokenContractInstance(address)
      const balance = await wrapperContract?.methods.balanceOf(userAddress).call()
      if (balance !== '0') {
        const modifiedBalance: PositionType = { balance: +convertFromBN(balance, decimals), address, endTime}
        positions.push(modifiedBalance)
      }
    }
  }

  // Prepare batches to get events from chain
  const blocksInBatch = 50000
  const latestBlock = await web3.eth.getBlockNumber()
  let fromBlock = lastBlockByNetwork[authStore.networkId]
  let toBlock = fromBlock + blocksInBatch 
  const batchAmount = Math.ceil((latestBlock - fromBlock) / blocksInBatch)

  for (let i of Array(batchAmount)) {
    try {
      // Waiting time between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get events
      await stakingContract?.getPastEvents('LongPositionWrapper', {fromBlock, toBlock}).then(async (events) => {
        const balances: { balance: string, address: string, blockNumber: number}[] = await Promise.all(events.map(async (event) => {
          const wrapperContract = createTokenContractInstance(event.returnValues.wrapper)
          const balance = await wrapperContract?.methods.balanceOf(userAddress).call()
          return { balance, address: event.returnValues.wrapper, blockNumber: event.blockNumber}
        }))

        // Remove zero balance and convert from BigNumber
        const modifiedBalances: { balance: number, address: string, blockNumber: number}[] = balances.filter(el => +el.balance).map(el => ({ ...el, balance: +convertFromBN(el.balance, decimals)}))
    
        // Get endTime
        const finalizedBalances: PositionType[] = await Promise.all(modifiedBalances.map(async (el) => {
          const der = await stakingContractReadOnly?.methods.derivative().call(undefined, el.blockNumber+1)
          return {...el, endTime: der.endTime}
        }))
        positions.push(...finalizedBalances)
      })
    } catch (error) {
      console.log({error})
      onError(error)
    }
    fromBlock = fromBlock + blocksInBatch
    toBlock = toBlock + blocksInBatch
  }
  
  return positions
}

export const getPurchasedProductsTheGraph = async (
  pool: PoolType,
  userAddress: string,
) => {
  const positions: PositionType[] = []
  const decimals = 18

  const { poolAddress } = pool
  try {
        const response = await fetchTheGraph(subgraphs[authStore.networkId], `
        {
          longPositionTokens(where: { stakingContractAddress: "${poolAddress.toLowerCase()}" }) {
            id
            longPositionAddress
            endTime
            stakingContractAddress
          }
        }
      `)
      const eventPositions: [{endTime: string, longPositionAddress: string}]  = response.longPositionTokens
      const balances: { balance: string, address: string, endTime: number }[] = await Promise.all(eventPositions.map(async (event) => {
        const wrapperContract = createTokenContractInstance(event.longPositionAddress)
        const balance = await wrapperContract?.methods.balanceOf(userAddress).call()
        return { balance, address: event.longPositionAddress, endTime: +event.endTime}
      }))
  
      // Remove zero balance and convert from BigNumber
      const modifiedBalances: { balance: number, address: string, endTime: number}[] = balances.filter(el => +el.balance).map(el => ({ ...el, balance: +convertFromBN(el.balance, decimals)}))
  
      positions.push(...modifiedBalances)
    } catch (error) {
      console.log({error})
      throw error
    }
    return positions
}

export const withdrawPosition = async (
  position: PositionType, 
  userAddress: string, 
  onConfirm: () => void, 
  onError: (error: Error) => void
) => {
  // Create contracts instances 
  const positionContract = createOpiumIERC20PositionContractInstance(position.address)

  // Create withdrawal tx
  const tx = positionContract?.methods.withdraw().send({from: userAddress})

  // Send tx
  return await sendTx(tx, onConfirm, onError)
}

export const getStakedBalance = async (poolAddress: string, userAddress: string): Promise<string> => {
  try {
    const contract = createStakingContractInstance(poolAddress)
    const tokenAddress = await contract?.methods.underlying().call({from: userAddress})
    const tokenContract = createTokenContractInstance(tokenAddress)
    return await contract?.methods.balanceOf(userAddress).call().then((userShares: string) => {
      return contract?.methods.calculateSharesToUnderlyingRatio(userShares).call().then((shares: string) => {
        return contract?.methods.decimals().call().then((decimals: string) => {
          return tokenContract?.methods.symbol().call().then((symbol: string) => {
            return`${Number(convertFromBN(shares, +decimals)).toFixed(3)} ${symbol}`
          })
        })
      })
    })
  } catch (error: any) {
    console.log({error})
    return 'Unable to fetch balance'
  }
}


export const getPoolPhase = async (poolAddress: string) => {
  const stakingContract = createStakingContractInstance(poolAddress)
  const {endTime} = await stakingContract?.methods.derivative().call()
  const epochLength = await stakingContract?.methods.EPOCH().call()
  const stakingPhaseLength = await stakingContract?.methods.STAKING_PHASE().call()
  const tradingPhaseLength = await stakingContract?.methods.TRADING_PHASE().call()
  let idleStakingTimeLimit = 0
  try {
    idleStakingTimeLimit = await stakingContract?.methods.idleStakingTimeLimit().call()
  } catch {
    idleStakingTimeLimit = +epochLength - +stakingPhaseLength - +tradingPhaseLength
  }
  const phaseInfo = getPhase(+epochLength, +stakingPhaseLength, +tradingPhaseLength, +endTime, +idleStakingTimeLimit)

  const format = 'DD MMM HH:mm'

  return {
    currentPhaseText: phaseInfo.currentPhaseText,
    stakingPhase: `${convertDateFromTimestamp(phaseInfo.stakingStart, format)} - ${convertDateFromTimestamp(phaseInfo.stakingEnd, format)}`,
    tradingPhase: `${convertDateFromTimestamp(phaseInfo.tradingStart, format)} - ${convertDateFromTimestamp(phaseInfo.tradingEnd, format)}`,
    notInitialized: `${convertDateFromTimestamp(phaseInfo.notInitializedStart, format)} - ${convertDateFromTimestamp(phaseInfo.notInitializedEnd, format)}`,
    stakingOnly: phaseInfo.stakingOnlyStart === phaseInfo.stakingOnlyEnd ? '' : `${convertDateFromTimestamp(phaseInfo.stakingOnlyStart, format)} - ${convertDateFromTimestamp(phaseInfo.stakingOnlyEnd, format)}`,
  }
}

export const checkPhase = async (poolAddress: string, currentPhase: string) => {
  if (currentPhase === 'REBALANCING' || currentPhase === 'TRADING' || currentPhase === 'WAITING' || currentPhase === 'STAKING (ONLY)') {
    return {
      isStaking: currentPhase === 'REBALANCING',
      isTrading:  currentPhase === 'TRADING',
      isNotInitialized: currentPhase === 'WAITING',
      isStakingOnly: currentPhase === 'STAKING (ONLY)'
    }
  }
  const phases = await getPoolPhase(poolAddress)
  return {
    isStaking: phases.currentPhaseText === 'REBALANCING',
    isTrading:  phases.currentPhaseText === 'TRADING',
    isNotInitialized: phases.currentPhaseText === 'WAITING',
    isStakingOnly: phases.currentPhaseText === 'STAKING (ONLY)'
  }
}

export const callOracle = async (
  oracleAddress: string, 
  poolAddress: string,
  userAddress: string,
  onConfirm: () => void, 
  onError: (error: Error) => void
) => {
  const oracleContract = createOracleWithCallbackContractInstance(oracleAddress)
  const stakingContract = createStakingContractInstance(poolAddress)

  const derivative = await stakingContract?.methods.derivative().call()
  const { endTime } = derivative
  const tx = oracleContract?.methods._callback(+endTime).send({ from: userAddress })

  return await sendTx(tx, onConfirm, onError)
}


export const executeLong = async (
  poolAddress: string,
  userAddress: string,
  onConfirm: () => void, 
  onError: (error: Error) => void
) => {
  const stakingContract = createStakingContractInstance(poolAddress)
  const longPositionWrapper = await stakingContract?.methods.longPositionWrapper().call()
  const longPositionTokenContract = createOpiumIERC20PositionContractInstance(longPositionWrapper)

  const derivative = await stakingContract?.methods.derivative().call()

  let derivativeParams = ['950000000000000000', '2500']
  try {
    derivativeParams = await stakingContract?.methods.getDerivativeParams().call()
  } catch (e) {}
  
  const { margin, endTime, oracleId, token, syntheticId } = derivative
  
  const executeArgs = {
    margin,
    endTime,
    oracleId,
    token,
    syntheticId,
    params: derivativeParams,
  }

  const tx = longPositionTokenContract?.methods.execute(executeArgs).send({ from: userAddress })

  return await sendTx(tx, onConfirm, onError)
}

export const initializeEpoch = async (
  poolAddress: string,
  userAddress: string,
  onConfirm: () => void, 
  onError: (error: Error) => void
) => {
  const stakingContract = createStakingContractInstance(poolAddress)
  const tx = stakingContract?.methods.initializeEpoch().send({ from: userAddress })

  return await sendTx(tx, onConfirm, onError)
  
}

export const isPoolMaintainable = async (poolAddress: string) => {
  const stakingContract = createStakingContractInstance(poolAddress)
  const derivative = await stakingContract?.methods.derivative().call()
  const { endTime } = derivative
  const now = Number((Date.now() / 1000).toFixed())
  return now > +endTime
}
