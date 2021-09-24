import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import { Button } from '@opiumteam/react-opium-components'
import authStore from '../../Services/Stores/AuthStore'
import {  wrapToWopium, unwrapToOpium, checkWrapperAllowance, makeApprove, getOpiumBalance, getWopiumBalance } from '../../Services/Utils/methods'
import { wrapperProducts } from '../../Services/DataBase/opium'

import './styles.scss'

const Wrapping: FC<{}> = () => {
  const alert = useAlert()
  const [ opiumValue, setOpiumValue ] = useState(0) 
  const [ wopiumValue, setWopiumValue ] = useState(0) 
  const [ opiumBalance, setOpiumBalance ] = useState(0) 
  const [ wopiumBalance, setWopiumBalance ] = useState(0) 

  const userAddress = authStore.blockchainStore.address

  useEffect(() => {
    updateBalance()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddress])


  const updateBalance = () => {
    const { marginAddress: opiumAddress, decimals: opiumDecimals } = wrapperProducts.opium
    getOpiumBalance(opiumAddress, userAddress, opiumDecimals).then(res => {
      setOpiumBalance(Number(res.toFixed(2)))
    })

    const { tokenManager, decimals: wopiumDecimals } = wrapperProducts.wopium
    getWopiumBalance(tokenManager, userAddress, wopiumDecimals).then(res => {
      setWopiumBalance(Number(res.toFixed(2)))
    })
  }

  const wrap = async () => {
    const { poolAddress, marginAddress, decimals } = wrapperProducts.opium

    const tokenAllowed = await checkWrapperAllowance(opiumValue, poolAddress, userAddress, marginAddress, decimals)
    if (!tokenAllowed) {
      makeApprove(
        poolAddress, 
        userAddress, 
        () => wrapToWopium(opiumValue, userAddress, () => {
          alert.success('Successfully wrapped')
          updateBalance()
        }, (e) => alert.error(e.message)),
        (e) => alert.error(e.message),
        marginAddress
        )
    } else {
      wrapToWopium(opiumValue, userAddress, () => {
        updateBalance()
        alert.success('Successfully wrapped')
      }, (e) => alert.error(e.message))
    }
  }

  const unwrap = async () => {
    const { poolAddress, marginAddress, decimals } = wrapperProducts.wopium

    const tokenAllowed = await checkWrapperAllowance(opiumValue, poolAddress, userAddress, marginAddress, decimals)
    
    if (!tokenAllowed) {
      makeApprove(
        poolAddress, 
        userAddress, 
        () => unwrapToOpium(wopiumValue, userAddress, () => {
          alert.success('Successfully unwrapped')
          updateBalance()
        }, (e) => alert.error(e.message)),
        (e) => alert.error(e.message),
        marginAddress
        )
    } else {
      unwrapToOpium(wopiumValue, userAddress, () => {
        alert.success('Successfully unwrapped')
        updateBalance()
      }, (e) => alert.error(e.message))
    }
  }
  
  return (
    <div className='wrapping-wrapper'>
      <div className='wrapping-item-wrapper'>
        <div>OPIUM</div>
        <div>Your balance: <br/>{opiumBalance} OPIUM</div>
        <div className='pools-list-item-input'>Amount to wrap: <input type='number' onChange={e => setOpiumValue(+e.target.value)} /></div>
        <Button label='wrap' onClick={wrap}/>
      </div>
      <div className='wrapping-item-wrapper'>
        <div>wOPIUM</div>
        <div>Transferable balance: <br/> {wopiumBalance} wOPIUM</div>
        <div className='pools-list-item-input'>Amount to unwrap: <input type='number' onChange={e => setWopiumValue(+e.target.value)} /></div>
        <Button label='unwrap' onClick={unwrap}/>
      </div>
    </div>
  )
}

export default observer(Wrapping)
