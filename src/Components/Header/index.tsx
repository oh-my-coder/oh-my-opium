import { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Button, DropdownSelector } from '@opiumteam/react-opium-components'
import authStore from '../../Services/Stores/AuthStore'
import { AuthType } from '@opiumteam/mobx-web3'

import './styles.scss'


const dropdownItems = [
  { title: 'Ethereum', value: '1' },
  { title: 'Binance', value: '56' },
  { title: 'Polygon', value: '137' },
]

const Header: FC<{}> = () => {

  const [dropDownTitle, setDropDownTitle] = useState(dropdownItems[0].title)

  const handleSelect = (index: string) => {
    setDropDownTitle(dropdownItems[+index].title)
    authStore.changeNetwork(dropdownItems[+index].title, +dropdownItems[+index].value)
  }

  const { requiredNetworkName, currentNetworkName} = authStore.blockchainStore

  return (
    <div className='header-wrapper'>
      <div className='header-title'>Oh My Opium</div>
      <DropdownSelector
        title={dropDownTitle}
        items={dropdownItems}
        onSelect={(eventKey) => handleSelect(eventKey)}
      />
      <div className={`header-network-wrapper ${requiredNetworkName !== currentNetworkName && 'red-network'}`}>
        <div>Required network: {requiredNetworkName}</div>
        <div>You current network: {currentNetworkName}</div>
      </div>
      <div className='header-buttons-wrapper'>
        <Button 
          variant='primary' 
          label={(authStore.loggedIn && authStore.blockchainStore.address) ? authStore.blockchainStore.address : 'Connect wallet'} 
          onClick={() => authStore.blockchainStore.login(AuthType.INJECTED)} 
        />
        {(authStore.loggedIn && authStore.blockchainStore.address) && 
        <Button 
          variant='primary' 
          label='logout' 
          onClick={() => authStore.blockchainStore.logout()} 
        />
      }
      </div>
    </div>
  )
}

export default observer(Header)
