import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import { Button } from '@opiumteam/react-opium-components'
import appStore from '../../Services/Stores/AppStore'
import authStore from '../../Services/Stores/AuthStore'
import { stakeIntoPool, checkAllowance, makeApprove, unstakeFromPool } from '../../Services/Utils/methods'
import Input from '../Input'

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
    const tokenAllowed = await checkAllowance(value, pool.poolAddress, userAddress)
    if (!tokenAllowed) {
      makeApprove(
        pool.poolAddress, 
        userAddress, 
        () => unstakeFromPool(value, pool.poolAddress, userAddress, () => alert.success('Token was successfully approved'), (e) => alert.error(e.message)),
        (e) => alert.error(e.message)
        )
    } else {
      unstakeFromPool(value, pool.poolAddress, userAddress, () => alert.success('Successfully unstaked'), (e) => alert.error(e.message))
    }
  }

  return (
    <div className='pools-list-wrapper'>
      {appStore.poolsByNetwork.map((pool) => {
        return <div className='pools-list-item-wrapper'>
          <div className='pools-list-item-title'>{pool.title}</div>
          <div className='pools-list-item-address'>Address: {pool.poolAddress}</div>
          <div>
          <Input onChange={setValue} />
            </div>
          <div className='pools-list-item-buttons-wrapper'>
            <Button variant='primary' label='Stake' onClick={() => makeDeposit(pool)} disabled={requiredNetworkName !== currentNetworkName}/>
            <Button variant='secondary' label='Unstake' onClick={() => makeWithdrawal(pool)} disabled={requiredNetworkName !== currentNetworkName}/>
          </div>
        </div>
      })}
    </div>
  )
}

export default observer(PoolsList)
