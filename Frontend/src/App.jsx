import { useState } from 'react'
import LoginScreen from './components/LoginScreen'
import AppShell from './components/AppShell'

function App() {
  const [screen, setScreen] = useState('login')

  return screen === 'login' ? (
    <LoginScreen onLogin={() => setScreen('app')} />
  ) : (
    <AppShell />
  )
}

export default App