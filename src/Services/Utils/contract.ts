import authStore from './../Stores/AuthStore'
import OpiumStaking from '../Blockchain/abis/Staking.json'
import IERC20 from '../Blockchain/abis/IERC20.json'
import { AbiItem } from 'web3-utils'

export const createStakingContractInstance = (address: string) => {
  const web3 = authStore.blockchain.getWeb3()
  if (!web3) {
    return
  }
  const contract = new web3.eth.Contract(OpiumStaking as AbiItem[], address)
  return contract
}

export const createTokenContractInstance = (address: string) => {
  const web3 = authStore.blockchain.getWeb3()
  if (!web3) {
    return
  }
  const contract = new web3.eth.Contract(IERC20 as AbiItem[], address)
  return contract
}