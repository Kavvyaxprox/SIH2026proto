import { useState } from 'react'
import DashboardScreen from './components/DashboardScreen'
import LoginScreen from './components/LoginScreen'

function App() {
  const [screen, setScreen] = useState('login')

  return screen === 'login' ? (
    <LoginScreen onLogin={() => setScreen('dashboard')} />
  ) : (
    <DashboardScreen onLogout={() => setScreen('login')} />
  )
}

export default App