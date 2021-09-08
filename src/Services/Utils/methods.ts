import { createStakingContractInstance, createTokenContractInstance } from './contract'
import { convertFromBN, convertToBN } from './bn'
import { sendTx } from './transaction'

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

  // Send tx
  const tx = stakingContract?.methods.withdraw(convertToBN(value, +decimals)).send({ from: userAddress })
  return await sendTx(tx, onConfirm, onError)
}

export const getStakedBalance = async (poolAddress: string, userAddress: string): Promise<number> => {
  const contract = createStakingContractInstance(poolAddress)
  return contract?.methods.balanceOf(userAddress).call().then((userShares: string) => {
    return contract?.methods.calculateSharesToUnderlyingRatio(userShares).call().then((shares: string) => {
      return contract?.methods.decimals().call().then((decimals: string) => {
        return +convertFromBN(shares, +decimals)
      })
    })
  })
}