import { createStakingContractInstance, createTokenContractInstance, createOpiumIERC20PositionContractInstance } from './contract'
import { convertFromBN, convertToBN } from './bn'
import { sendTx } from './transaction'
import { PoolType, PositionType } from './types'
import { getPhase } from './phases'
import { convertDateFromTimestamp } from './date'

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'


export const makeApprove = async (
  poolAddress: string, 
  userAddress: string, 
  onConfirm: () => void, 
  onError: (error: Error) => void
): Promise<string> => {

  // Create contracts instances 
  const stakingContract = createStakingContractInstance(poolAddress)
  const tokenAddress =  await stakingContract?.methods.underlying().call()
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


export const checkAllowance = async (
  value: number,
  poolAddress: string, 
  userAddress: string, 
) => {

  // Create contracts instances 
  const stakingContract = createStakingContractInstance(poolAddress)
  const tokenAddress = await stakingContract?.methods.underlying().call({from: userAddress})
  const tokenContract = createTokenContractInstance(tokenAddress)

  // Check allowance
  const allowance = await tokenContract?.methods.allowance(userAddress, poolAddress).call().then((allowance: string) => {
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

  // Calculate premium
  let premiumBN
  try {
    premiumBN = await stakingContract?.methods.getRequiredPremium(quantity).call()
  } catch {
    return onInsufficientLiquidity()
  }
  const premium = +convertFromBN(premiumBN, decimals)

  // Send tx
  const tx = stakingContract?.methods.hedge(
    quantity,
    convertToBN(premium * 1.05, decimals)).send({ from: userAddress })
  return await sendTx(tx, onConfirm, onError)
}



export const getPurchasedProducts = async (
  poolAddress: string,
  userAddress: string,
  onError: (error: any) => void,
  ) => {
  const decimals = 18

  // Create contracts instance
  const stakingContract = createStakingContractInstance(poolAddress)

  // Retrieve events and get balance
  try {
    return stakingContract?.getPastEvents('LongPositionWrapper', {fromBlock: 0, toBlock: 'latest'}).then(async (events) => {
      const balances: { balance: string, address: string, blockNumber: number}[] = await Promise.all(events.map(async (event) => {
        const wrapperContract = createTokenContractInstance(event.returnValues.wrapper)
        const balance = await wrapperContract?.methods.balanceOf(userAddress).call()
        return { balance, address: event.returnValues.wrapper, blockNumber: event.blockNumber}
      }))

      // Remove zero balance and convert from BigNumber
      const modifiedBalances: { balance: number, address: string, blockNumber: number}[] = balances.filter(el => +el.balance).map(el => ({ ...el, balance: +convertFromBN(el.balance, decimals)}))
  
      // Get endTime
      const finalizedBalances: PositionType[] = await Promise.all(modifiedBalances.map(async (el) => {
        const der = await stakingContract?.methods.derivative().call(undefined, el.blockNumber+1)
        return {...el, endTime: der.endTime}
      }))
      return finalizedBalances
    })
  } catch (error) {
    console.log({error})
    onError(error)
  }
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

  const phaseInfo = getPhase(+epochLength, +stakingPhaseLength, +tradingPhaseLength, +endTime)

  return {
    currentPhaseText: phaseInfo.currentPhaseText,
    stakingPhase: `${convertDateFromTimestamp(phaseInfo.stakingStart, 'DD.MM.YYYY HH:mm')} - ${convertDateFromTimestamp(phaseInfo.stakingEnd, 'DD.MM.YYYY HH:mm')}`,
    tradingPhase: `${convertDateFromTimestamp(phaseInfo.tradingStart, 'DD.MM.YYYY HH:mm')} - ${convertDateFromTimestamp(phaseInfo.tradingEnd, 'DD.MM.YYYY HH:mm')}`,
    notInitialized: `${convertDateFromTimestamp(phaseInfo.notInitializedStart, 'DD.MM.YYYY HH:mm')} - ${convertDateFromTimestamp(phaseInfo.notInitializedEnd, 'DD.MM.YYYY HH:mm')}`,
  }
}

export const checkPhase = async (poolAddress: string, currentPhase: string) => {
  if (currentPhase === 'REBALANCING' || currentPhase === 'TRADING' || currentPhase === 'WAITING') {
    return {
      isStaking: currentPhase === 'REBALANCING',
      isTrading:  currentPhase === 'TRADING',
      isNotInitialized: currentPhase === 'WAITING'
    }
  }
  const phases = await getPoolPhase(poolAddress)
  return {
    isStaking: phases.currentPhaseText === 'REBALANCING',
    isTrading:  phases.currentPhaseText === 'TRADING',
    isNotInitialized: phases.currentPhaseText === 'WAITING'
  }

}

