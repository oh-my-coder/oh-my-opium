import { action, computed, observable, reaction } from "mobx"
import authStore from "./AuthStore"
import { ethPools, bscPools, polygonPools } from './../DataBase/pools'
import { PoolType } from '../Utils/types'

export class AppStore {

  @observable requestsAreNotAllowed: boolean = ((authStore.blockchainStore.requiredNetworkName !== authStore.blockchainStore.currentNetworkName) || !authStore.blockchainStore.address)

  private _poolsByNetwork: {[key: number]: PoolType[]} = {
    1: ethPools,
    56: bscPools,
    137: polygonPools
  }

  constructor() {
    reaction(() => authStore.blockchainStore.address, this.setRequestsAreNotAllowedReaction)
    reaction(() => authStore.blockchainStore.requiredNetworkName, this.setRequestsAreNotAllowedReaction)
    reaction(() => authStore.blockchainStore.currentNetworkName, this.setRequestsAreNotAllowedReaction)
  }


  @action
  setRequestsAreNotAllowedReaction = () => {
    this.requestsAreNotAllowed = ((authStore.blockchainStore.requiredNetworkName !== authStore.blockchainStore.currentNetworkName) || !authStore.blockchainStore.address)
  }

  @computed
  get poolsByNetwork(): PoolType[] {
    return this._poolsByNetwork[authStore.networkId]
  }
}

export default new AppStore()
