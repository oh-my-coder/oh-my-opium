import './App.css';
import Header from './Components/Header'
import PoolsList from './Components/PoolsList'
import { positions, Provider as AlertProvider } from 'react-alert'

const options = {
  timeout: 5000,
  position: positions.TOP_LEFT,
  containerStyle: {
    zIndex: 100, 
  }
}

const AlertTemplate = ({options, message, close }:any) => (
  <div style={{ margin: 20, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: '20rem', height: '4rem', backgroundColor: (options.type === 'error' ? 'red' : 'green')}}>
    {message}
  </div>
) 

function App() {
  return (
    <AlertProvider template={AlertTemplate} {...options}>
      <div className="App">
        <Header />
        <PoolsList />
      </div>
    </AlertProvider>
  );
}

export default App;
