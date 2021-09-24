import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import { ETheme, Popup } from '@opiumteam/react-opium-components'
import appStore from '../../Services/Stores/AppStore'
import authStore from '../../Services/Stores/AuthStore'
import {  getPurchasedProducts } from '../../Services/Utils/methods'
import { PoolType, PositionType } from '../../Services/Utils/types'
import PositionsList from '../PositionsList'
import PoolListItem from './poolListItem'

import './styles.scss'

const PoolsList: FC<{}> = () => {
  const [ popupIsOpened, setPopupIsOpened ] = useState(false) 
  const [ positions, setPositions ] = useState<PositionType[]>([])
  const [ positionProductTitle, setPositionProductTitle ] = useState<string>('')
  const alert = useAlert()

  const userAddress = authStore.blockchainStore.address

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
        return <PoolListItem pool={pool} showPurchasedProducts={() => showPurchasedProducts(pool)}/>
      })}
    </div>
  )
}

export default observer(PoolsList)
