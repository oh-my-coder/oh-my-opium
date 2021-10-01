import { FC } from 'react'
import { observer } from 'mobx-react'
import { useAlert } from 'react-alert'
import { Button, OpiumLink, ETheme } from '@opiumteam/react-opium-components'
import authStore from '../../Services/Stores/AuthStore'
import appStore from '../../Services/Stores/AppStore'
import { withdrawPosition } from '../../Services/Utils/methods'
import { PositionType } from '../../Services/Utils/types'
import { convertDateFromTimestamp } from '../../Services/Utils/date'
import { getScanLink } from '../../Services/Utils/transaction'

import './styles.scss'


type Props = {
  positions: PositionType[]
}

const PositionsList: FC<Props> = (props: Props) => {

  const { address } = authStore.blockchainStore
  const { positions } = props
  const alert = useAlert()

  const makeWithdrawal = async (position: PositionType) => {
    withdrawPosition(position, address, () => alert.success('Successfully withdrew'), (e) => alert.error(e.message))
  }

  return (
    <div className='positions-wrapper'>
      {positions.map((position, i) => {
        const isExpired = Date.now()/1000 > position.endTime
        const date = convertDateFromTimestamp(position.endTime, 'DD-MMM-YY')
        return (
          <div className='position-item-wrapper' key={i}>
            <div className='position-item-address'>Position address: <OpiumLink theme={ETheme.LIGHT} newTab={true} label={position.address} href={getScanLink(position.address, authStore.networkId)} /></div>
            <div>Insured amount: <br/>{position.balance}</div>
            <div className={`${isExpired ? 'red-date' : 'green-date'}`}>{isExpired ? `Expired at ${date}` : `Will expire at ${date}`}</div>
            <div>
              <Button theme={ETheme.LIGHT} variant='secondary' label='withdraw' onClick={() => makeWithdrawal(position)} disabled={appStore.requestsAreNotAllowed  || !isExpired}/>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default observer(PositionsList)
