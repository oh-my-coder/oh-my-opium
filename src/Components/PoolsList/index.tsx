import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import { Button, OpiumLink, ETheme } from '@opiumteam/react-opium-components'
import appStore from '../../Services/Stores/AppStore'
import authStore from '../../Services/Stores/AuthStore'
import { stakeIntoPool, checkAllowance, makeApprove, unstakeFromPool } from '../../Services/Utils/methods'

import './styles.scss'

const PoolsList: FC<{}> = () => {
  const [ value, setValue ] = useState(0) 
  const alert = useAlert()
  const { requiredNetworkName, currentNetworkName} = authStore.blockchainStore


  const userAddress = authStore.blockchainStore.address

  const makeDeposit = async (pool: {title: string, poolAddress: string}) => {
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

  
  const makeWithdrawal = async (pool: {title: string, poolAddress: string}) => {
    unstakeFromPool(value, pool.poolAddress, userAddress, () => alert.success('Successfully unstaked'), (e) => alert.error(e.message))
  }


  const getBalance = (poolAddress: string) => {
    const pool = appStore.poolsWithBalance.find(pool => Object.keys(pool)[0] === poolAddress)
    return pool ? pool[poolAddress] : 0
  }
  
  return (
    <div className='pools-list-wrapper'>
      {appStore.poolsByNetwork.map((pool) => {
        return <div className='pools-list-item-wrapper' key={pool.title}>
          <div className='pools-list-item-title'>{pool.title}</div>
          <div className='pools-list-item-address'>Address: <OpiumLink theme={ETheme.DARK} newTab={true} label={pool.poolAddress} href={`https://etherscan.io/address/${pool.poolAddress}`} /></div>
          
          <div className='pools-list-item-balance'>Balance: <div>{appStore.balanceIsLoading ? 'Loading...' : getBalance(pool.poolAddress)}</div></div>
          <div className='pools-list-item-input'>Amount: <input type='number' onChange={e => setValue(+e.target.value)} /></div>
          <div className='pools-list-item-buttons-wrapper'>
            <Button variant='primary' label='stake' onClick={() => makeDeposit(pool)} disabled={requiredNetworkName !== currentNetworkName}/>
            <Button variant='secondary' label='unstake' onClick={() => makeWithdrawal(pool)} disabled={requiredNetworkName !== currentNetworkName}/>
          </div>
        </div>
      })}
    </div>
  )
}

export default observer(PoolsList)
