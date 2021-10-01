import { FC } from 'react'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import { Button } from '@opiumteam/react-opium-components'
import { OracleTypeEnum, PoolType } from '../../Services/Utils/types'
import { initializeEpoch, callOracle, executeLong } from '../../Services/Utils/methods'
import authStore from '../../Services/Stores/AuthStore'

import './styles.scss'

type Props = {
  pool: PoolType | null
}

const Maintenance: FC<Props> = (props: Props) => {

  const { pool } = props
  const alert = useAlert()

  const userAddress = authStore.blockchainStore.address

  const handleCallOracle = () => {

    if (!pool || !pool.oracle) return
    
    if (pool.oracle.type === OracleTypeEnum.OPTIMISTIC) {
      window.open('https://oracles.opium.network/')
      return
    }

    callOracle(pool.oracle.address, pool.poolAddress, userAddress, () => alert.success('Oracle was successfully called'), (e) => alert.error(e.message))
  }

  const handleExecuteLong = () => {
    if (!pool || !pool.oracle) return
    executeLong(pool.poolAddress, userAddress, () => alert.success('Payouts were successfully distributed'), (e) => alert.error(e.message))
  }

  const handleInitialize = () => {
    if (!pool || !pool.oracle) return
    initializeEpoch(pool.poolAddress, userAddress, () => alert.success('Epoch was successfully initialized'), (e) => alert.error(e.message))
  }

  return (
    <div className='maintenance-wrapper'>
      <Button label='1. call oracle' onClick={handleCallOracle}></Button>
      <Button label='2. distribute payouts' onClick={handleExecuteLong}></Button>
      <Button label='3. initialize' onClick={handleInitialize}></Button>
    </div>
  )
}

export default observer(Maintenance)
