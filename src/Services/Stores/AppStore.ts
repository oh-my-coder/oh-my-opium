import { action, computed, observable, reaction } from "mobx"
import authStore from "./AuthStore"
import { ethPools, bscPools, polygonPools } from './../DataBase/pools'
import { getStakedBalance } from '../Utils/methods'

export class AppStore {

  @observable poolsWithBalance: {[x: string]: string | number}[] = []
  @observable balanceIsLoading: boolean = false




  private _poolsByNetwork: {[key: number]: Array<{title: string, poolAddress: string}>} = {
    1: ethPools,
    56: bscPools,
    137: polygonPools
  }

  constructor() {
    reaction(() => authStore.blockchainStore.address, this.fillBalanceReaction)
  }

  @action
  fillBalanceReaction = async () => {
    this.setBalanceIsLoading(true)
    this.poolsWithBalance = await Promise.all(this.poolsByNetwork.map( async (pool) => {
      const balance = await getStakedBalance(pool.poolAddress, authStore.blockchainStore.address)
      return { [pool.poolAddress]: balance }
    }))
    this.setBalanceIsLoading(false)
  }

  @computed
  get poolsByNetwork(): Array<{title: string, poolAddress: string}> {
    return this._poolsByNetwork[authStore.networkId]
  }

  @action
  setBalance = async (poolAddress: string, userAddress: string) => {
    const balance = await getStakedBalance(poolAddress, userAddress)
    this.poolsWithBalance = [...this.poolsWithBalance, {[poolAddress]: balance}]
  }

  @action
  setBalanceIsLoading = (flag: boolean) => {
    this.balanceIsLoading = flag
  }

  
}

export default new AppStore()
