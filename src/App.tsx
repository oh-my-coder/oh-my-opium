import './App.css';
import Header from './Components/Header'
import PoolsList from './Components/PoolsList'
import { positions, Provider as AlertProvider } from 'react-alert'
import { BrowserView, MobileView } from "react-device-detect"
const options = {
  timeout: 5000,
  position: positions.TOP_LEFT,
  containerStyle: {
    zIndex: 100, 
  }
}

const AlertTemplate = ({options, message, close }:any) => (
  <div style={{ 
    margin: 20, 
    borderRadius: 10, 
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-evenly', 
    width: '20rem', 
    height: '4rem', 
    backgroundColor: (options.type === 'error' ? '#FB80CD' : '#2ECD94'), 
    color: '#0A0A1E',
    padding: '1rem'
  }}>
    {message}
  </div>
) 

function App() {
  return (
    <AlertProvider template={AlertTemplate} {...options}>
      <div className="App">
        <MobileView >
          <div className='mobile-text'>Opium RealT UI does not support mobile devices yet. <br/><br/> Please use desktop version.</div>
        </MobileView>
        <BrowserView>
          <Header />
          <PoolsList />
        </BrowserView>
      </div>
    </AlertProvider>
  );
}

export default App;
