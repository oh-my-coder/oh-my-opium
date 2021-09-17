import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import { Button, OpiumLink, ETheme, Popup } from '@opiumteam/react-opium-components'
import appStore from '../../Services/Stores/AppStore'
import authStore from '../../Services/Stores/AuthStore'
import { stakeIntoPool, checkAllowance, makeApprove, unstakeFromPool, buyProduct, getPurchasedProducts } from '../../Services/Utils/methods'
import { PoolType, PositionType } from '../../Services/Utils/types'
import PositionsList from '../PositionsList'

import './styles.scss'

const PoolsList: FC<{}> = () => {
  const [ value, setValue ] = useState(0) 
  const [ popupIsOpened, setPopupIsOpened ] = useState(false) 
  const [ positions, setPositions ] = useState<PositionType[]>([])
  const [ positionProductTitle, setPositionProductTitle ] = useState<string>('')
  const alert = useAlert()
  const { requiredNetworkName, currentNetworkName} = authStore.blockchainStore

  const userAddress = authStore.blockchainStore.address

  const makeStake = async (pool: PoolType) => {
    const tokenAllowed = await checkAllowance(value, pool.poolAddress, userAddress)
    if (!tokenAllowed) {
      makeApprove(
        pool.poolAddress, 
        userAddress, 
        () => stakeIntoPool(value, pool.poolAddress, userAddress, () => alert.success('Token was successfully approved'), (e) => alert.error(e.message)),
        (e) => alert.error(e.message)
        )
    } else {
      stakeIntoPool(value, pool.poolAddress, userAddress, () => alert.success('Successfully staked'), (e) => alert.error(e.message))
    }
  }

  const makeHedging = async (pool: PoolType) => {
    const tokenAllowed = await checkAllowance(value, pool.poolAddress, userAddress)
    if (!tokenAllowed) {
      makeApprove(
        pool.poolAddress, 
        userAddress, 
        () => buyProduct(value, pool, userAddress, () => alert.success('Successfully bought the product'), (e) => alert.error(e.message), () => alert.error('Pool has insufficient liquidity')),
        (e) => alert.error(e.message)
        )
    } else {
      buyProduct(value, pool, userAddress, () => alert.success('Successfully bought the product'), (e) => alert.error(e.message), () => alert.error('Pool has insufficient liquidity'))
    }
  }

  
  const makeUnstake = async (pool: PoolType) => {
    unstakeFromPool(value, pool.poolAddress, userAddress, () => alert.success('Successfully unstaked'), (e) => alert.error(e.message))
  }


  const getBalance = (poolAddress: string) => {
    const pool = appStore.poolsWithBalance.find(pool => Object.keys(pool)[0] === poolAddress)
    return pool ? pool[poolAddress] : 0
  }

  const showPurchasedProducts = async (pool: PoolType) => {
    const positions = await getPurchasedProducts(pool.poolAddress, userAddress, (e) => alert.error(e.message))
    if (positions && positions.length) {
      setPopupIsOpened(true)
      setPositions(positions)
      setPositionProductTitle(pool.title)
    } else {
      alert.error('There are no purchased products')
    }
  }

  const closePopup = () => {
    setPopupIsOpened(false)
      setPositionProductTitle('')
      setPositions([])
  }
  
  return (
    <div className='pools-list-wrapper'>
      <Popup
        theme={ETheme.DARK}
        titleSize="lg"
        title="Purchased products"
        subtitle={positionProductTitle}
        className='positions-list-popup'
        popupIsOpen={popupIsOpened}
        closePopup={closePopup}
        component={<PositionsList positions={positions}/>}
      />
      {appStore.poolsByNetwork.map((pool) => {
        return <div className='pools-list-item-wrapper' key={pool.title}>
          <div className='pools-list-item-title'>
            <div>{pool.title}</div>
            <div className='pools-list-item-address'>Address: <OpiumLink theme={ETheme.DARK} newTab={true} label={pool.poolAddress} href={`https://etherscan.io/address/${pool.poolAddress}`} /></div>
          </div>
          
          <div className='pools-list-item-balance-wrapper'>
            <div className='pools-list-item-input'>Amount: <input type='number' onChange={e => setValue(+e.target.value)} /></div>
            <div className='pools-list-item-balance'>Staked balance: <div>{appStore.balanceIsLoading ? 'Loading...' : getBalance(pool.poolAddress)}</div></div>
          </div>

          <div className='pools-list-item-empty-space'/>

          <div className='pools-list-item-buttons-wrapper'>
            <Button variant='secondary' className='blue' label='buy product' onClick={() => makeHedging(pool)} disabled={(requiredNetworkName !== currentNetworkName) || pool.isSuspended}/>
          </div>
          
          
          <div className='pools-list-item-buttons-wrapper'>
            <Button variant='primary' label='stake' onClick={() => makeStake(pool)} disabled={(requiredNetworkName !== currentNetworkName) || pool.isSuspended}/>
            <Button variant='secondary' label='unstake' onClick={() => makeUnstake(pool)} disabled={requiredNetworkName !== currentNetworkName}/>
          </div>

          <div className='pools-list-item-buttons-wrapper'>
            <Button variant='secondary' className='green' label='purchased products' onClick={() => showPurchasedProducts(pool)} disabled={(requiredNetworkName !== currentNetworkName) || (requiredNetworkName === 'Binance Smart Chain') || (requiredNetworkName === 'Polygon Network')}/>
          </div>
        </div>
      })}
    </div>
  )
}

export default observer(PoolsList)
