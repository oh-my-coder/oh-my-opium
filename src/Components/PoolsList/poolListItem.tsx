import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import { Button, OpiumLink, ETheme } from '@opiumteam/react-opium-components'
import appStore from '../../Services/Stores/AppStore'
import authStore from '../../Services/Stores/AuthStore'
import { 
  stakeIntoPool, checkAllowance, 
  makeApprove, unstakeFromPool, 
  buyProduct, checkTokenBalance, 
  checkStakedBalance, getPoolPhase, 
  getStakedBalance, checkPhase
} from '../../Services/Utils/methods'
import { PoolType } from '../../Services/Utils/types'
import { getScanLink } from '../../Services/Utils/transaction'

import './styles.scss'


type Props = {
  pool: PoolType
  showPurchasedProducts: Function
}

const PoolsList: FC<Props> = (props: Props) => {

  const { pool, showPurchasedProducts } = props

  const [ stakeValue, setStakeValue ] = useState(0) 
  const [ protectValue, setProtectValue ] = useState(0) 
  const [ balance, setBalance ] = useState('Load to see') 
  const [ balanceIsLoading, setBalanceIsLoading ] = useState(false)
  const [ phaseInfo, setPhaseInfo ] = useState<{currentPhaseText: string, stakingPhase: string ,tradingPhase: string, notInitialized: string}>(
    {
      currentPhaseText: 'Load to see',
      stakingPhase: 'Load to see',
      tradingPhase: 'Load to see',
      notInitialized: 'Load to see'
    }
  )
  const [ phaseInfoIsLoading, setPhaseInfoIsLoading ] = useState(false)

  const { requiredNetworkName } = authStore.blockchainStore

  useEffect(() => {
    setPhaseInfo({
      currentPhaseText: 'Load to see',
      stakingPhase: 'Load to see',
      tradingPhase: 'Load to see',
      notInitialized: 'Load to see'
    })
      setBalance('Load to see')
  }, [requiredNetworkName])

  const alert = useAlert()

  const userAddress = authStore.blockchainStore.address

  const makeStake = async () => {
    const insufficientBalance = await checkTokenBalance(pool.poolAddress, userAddress, stakeValue)
    if (insufficientBalance) {
      alert.error('Insufficient balance')
      return
    }
    const tokenAllowed = await checkAllowance(stakeValue, pool.poolAddress, userAddress)
    if (!tokenAllowed) {
      makeApprove(
        pool.poolAddress, 
        userAddress, 
        () => stakeIntoPool(stakeValue, pool.poolAddress, userAddress, () => alert.success('Token was successfully approved'), (e) => alert.error(e.message)),
        (e) => alert.error(e.message)
        )
    } else {
      stakeIntoPool(stakeValue, pool.poolAddress, userAddress, () => alert.success('Successfully staked'), (e) => alert.error(e.message))
    }
  }

  const makeHedging = async () => {

    const { isTrading } = await checkPhase(pool.poolAddress, phaseInfo.currentPhaseText)
    if (!isTrading) {
      alert.error('Purchasing is available only during trading phase')
      return
    }

    const tokenAllowed = await checkAllowance(protectValue, pool.poolAddress, userAddress)
    if (!tokenAllowed) {
      makeApprove(
        pool.poolAddress, 
        userAddress, 
        () => buyProduct(protectValue, pool, userAddress, () => alert.success('Successfully bought the product'), (e) => alert.error(e.message), () => alert.error('Pool has insufficient liquidity')),
        (e) => alert.error(e.message)
        )
    } else {
      buyProduct(protectValue, pool, userAddress, () => alert.success('Successfully bought the product'), (e) => alert.error(e.message), () => alert.error('Pool has insufficient liquidity'))
    }
  }

  
  const makeUnstake = async () => {
    const { isStaking } = await checkPhase(pool.poolAddress, phaseInfo.currentPhaseText)
    if (!isStaking) {
      alert.error('Unstaking is available only during rebalancing phase')
      return
    }

    const insufficientStake = await checkStakedBalance(pool.poolAddress, userAddress, stakeValue)
    if (insufficientStake) {
      alert.error('insufficient staked balance')
      return
    }
    unstakeFromPool(stakeValue, pool.poolAddress, userAddress, () => alert.success('Successfully unstaked'), (e) => alert.error(e.message))
  }

  const loadBalance = async () => {
    setBalanceIsLoading(true)
    const balance = await getStakedBalance(pool.poolAddress, userAddress)
    setBalance(balance)
    setBalanceIsLoading(false)
  }

  const loadPhase = async() => {
    setPhaseInfoIsLoading(true)
    const phases = await getPoolPhase(pool.poolAddress)
    setPhaseInfo(phases)
    setPhaseInfoIsLoading(false)
  }
  
  return (
    <div className='pools-list-item-wrapper' key={pool.title}>
      <div className='pools-list-item-first-column'>
        <div className='pools-list-item-first-column-title'>{pool.title}</div>
        <div className='pools-list-item-address'><OpiumLink theme={ETheme.LIGHT} newTab={true} label={pool.poolAddress} href={getScanLink(pool.poolAddress, authStore.networkId)} /></div>
        {pool.isSuspended ? <div>Pool is suspended</div> : <div className='pools-list-item-phase-wrapper'>
          <div className='pools-list-item-phase'>Current phase: {phaseInfoIsLoading ? 'Loading...' : phaseInfo.currentPhaseText}</div>
          <div className='pools-list-item-phase'>Rebalancing phase: {phaseInfoIsLoading ? 'Loading...' : phaseInfo.stakingPhase}</div>
          <div className='pools-list-item-phase'>Trading phase: {phaseInfoIsLoading ? 'Loading...' : phaseInfo.tradingPhase}</div>
          <div className='pools-list-item-phase'>Waiting phase: {phaseInfoIsLoading ? 'Loading...' : phaseInfo.notInitialized}</div>
        </div>}
      </div>
      
      <div className='pools-list-item-second-column'>
        <div className='pools-list-item-input'>Amount to stake: <input type='number' onChange={e => setStakeValue(+e.target.value)} /></div>
        <div className='pools-list-item-second-column-buttons-wrapper'>
          <Button theme={ETheme.LIGHT} variant='secondary' className='green' label='stake' onClick={makeStake} disabled={appStore.requestsAreNotAllowed || pool.isSuspended}/>
          <Button theme={ETheme.LIGHT} variant='secondary' label='unstake' onClick={makeUnstake} disabled={appStore.requestsAreNotAllowed || pool.isSuspended}/>
        </div>
        <div className='pools-list-item-balance'>
          <div>Staked balance: </div>
          <div>{balanceIsLoading ? 'Loading...' : balance}</div>
        </div>
      </div>

      <div className='pools-list-item-third-column'>
        <div className='pools-list-item-input'>Amount to protect: <input type='number' onChange={e => setProtectValue(+e.target.value)} /></div>
        <Button theme={ETheme.LIGHT} variant='secondary' className='green' label='buy product' onClick={makeHedging} disabled={appStore.requestsAreNotAllowed || pool.isSuspended}/>
        <div className='pools-list-item-purchase'>
          <div>Purchased products: </div>
          <Button  theme={ETheme.LIGHT} size="sm" variant='secondary' className='blue' label='check' onClick={showPurchasedProducts} disabled={appStore.requestsAreNotAllowed || (requiredNetworkName === 'Binance Smart Chain') || (requiredNetworkName === 'Polygon Network')}/>
        </div>
      </div>

      <div className='pools-list-item-fourth-column'>
          <div>Load pool's data: </div>
          <div className='pools-list-item-fourth-column-buttons-wrapper'>
            <Button theme={ETheme.LIGHT} variant='secondary' className='blue' label='staked balance' onClick={loadBalance} disabled={appStore.requestsAreNotAllowed}/>
            <Button theme={ETheme.LIGHT} variant='secondary' className='blue' label='phases' onClick={loadPhase} disabled={appStore.requestsAreNotAllowed}/>
          </div>
      </div>
    </div>
  )
}

export default observer(PoolsList)
