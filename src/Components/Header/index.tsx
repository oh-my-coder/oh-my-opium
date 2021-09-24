import { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { AuthType } from '@opiumteam/mobx-web3'
import { Button, DropdownSelector, OpiumLink, ETheme } from '@opiumteam/react-opium-components'
import authStore from '../../Services/Stores/AuthStore'
import appStore from '../../Services/Stores/AppStore'
import { getScanLink } from '../../Services/Utils/transaction'

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

  const { requiredNetworkName, currentNetworkName, address} = authStore.blockchainStore

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
        <Button label='wOPIUM' onClick={() => {appStore.setWrappingPopupIsOpened(true)}} disabled={appStore.requestsAreNotAllowed || authStore.blockchainStore.requiredNetworkName !== 'Mainnet'}/>
        {(authStore.loggedIn && authStore.blockchainStore.address) && 
        <OpiumLink theme={ETheme.DARK} newTab={true} label={address} href={getScanLink(address, authStore.networkId)} />
      }
      <Button 
        variant='primary' 
        label={(authStore.loggedIn && address) ? 'logout' : 'login'} 
        onClick={(authStore.loggedIn && address) ? () => authStore.blockchainStore.logout() : () => authStore.blockchainStore.login(AuthType.INJECTED)} 
      />
      </div>
    </div>
  )
}

export default observer(Header)
