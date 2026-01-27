import { GravityProvider } from './context/GravityContext';
import { RadioDashboard } from './components/Radio/RadioDashboard';
import './index.css';

function App() {
  return (
    <GravityProvider>
      <RadioDashboard />
    </GravityProvider>
  );
}

export default App;
