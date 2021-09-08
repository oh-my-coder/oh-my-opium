import { computed } from "mobx"
import authStore from "./AuthStore"
import { ethPools, bscPools, polygonPools } from './../DataBase/pools'

export class AppStore {

  private _poolsByNetwork: {[key: number]: Array<{title: string, poolAddress: string}>} = {
    1: ethPools,
    56: bscPools,
    137: polygonPools
  }

  // constructor() {}

  @computed
  get poolsByNetwork(): Array<{title: string, poolAddress: string}> {
    return this._poolsByNetwork[authStore.networkId]
  }
}

export default new AppStore()
