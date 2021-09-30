import { AbiItem } from 'web3-utils'
import authStore from './../Stores/AuthStore'
import OpiumStaking from '../Blockchain/abis/Staking.json'
import IERC20 from '../Blockchain/abis/IERC20.json'
import OpiumIERC20Positions from '../Blockchain/abis/OpiumIERC20Positions.json'
import Wrapper from '../Blockchain/abis/Wrapper.json'
import TokenManager from '../Blockchain/abis/TokenManager.json'
import OracleWithCallback from '../Blockchain/abis/OracleWithCallback.json'


export const createStakingContractInstance = (address: string) => {
  const web3 = authStore.blockchain.getWeb3()
  if (!web3) {
    return
  }
  const contract = new web3.eth.Contract(OpiumStaking as AbiItem[], address)
  return contract
}

export const createReadOnlyStakingContractInstance = (address: string) => {
  const web3 = authStore.readOnlyWeb3
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

export const createOpiumIERC20PositionContractInstance = (address: string) => {
  const web3 = authStore.blockchain.getWeb3()
  if (!web3) {
    return
  }
  const contract = new web3.eth.Contract(OpiumIERC20Positions as AbiItem[], address)
  return contract
}

export const createWrapperContractInstance = (address: string) => {
  const web3 = authStore.blockchain.getWeb3()
  if (!web3) {
    return
  }
  const contract = new web3.eth.Contract(Wrapper as AbiItem[], address)
  return contract
}

export const createTokenManagerContractInstance = (address: string) => {
  const web3 = authStore.blockchain.getWeb3()
  if (!web3) {
    return
  }
  const contract = new web3.eth.Contract(TokenManager as AbiItem[], address)
  return contract
}

export const createOracleWithCallbackContractInstance = (address: string) => {
  const web3 = authStore.blockchain.getWeb3()
  if (!web3) {
    return
  }
  const contract = new web3.eth.Contract(OracleWithCallback as AbiItem[], address)
  return contract
}
