import { FC } from 'react'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import moment from 'moment'
import { Button, OpiumLink, ETheme } from '@opiumteam/react-opium-components'
import authStore from '../../Services/Stores/AuthStore'
import { withdrawPosition } from '../../Services/Utils/methods'
import { PositionType } from '../../Services/Utils/types'

import './styles.scss'


type Props = {
  positions: PositionType[]
}

const PositionsList: FC<Props> = (props: Props) => {

  const { requiredNetworkName, currentNetworkName, address} = authStore.blockchainStore
  const { positions } = props
  const alert = useAlert()

  const makeWithdrawal = async (position: PositionType) => {
    withdrawPosition(position, address, () => alert.success('Successfully withdrew'), (e) => alert.error(e.message))
  }

  return (
    <div className='positions-wrapper'>
      {positions.map((position, i) => {
        const isExpired = Date.now()/1000 > position.endTime
        const date = moment.unix(position.endTime).format('DD-MMM-YY')
        return (
          <div className='position-item-wrapper' key={i}>
            <div className='position-item-address'>Position address: <OpiumLink theme={ETheme.DARK} newTab={true} label={position.address} href={`https://etherscan.io/address/${position.address}`} /></div>
            <div>Insured amount: <br/>{position.balance}</div>
            <div className={`${isExpired ? 'red-date' : 'green-date'}`}>{isExpired ? `Expired at ${date}` : `Will expire at ${date}`}</div>
            <div>
              <Button variant='secondary' label='withdraw' onClick={() => makeWithdrawal(position)} disabled={(requiredNetworkName !== currentNetworkName) || !isExpired}/>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default observer(PositionsList)
