import { useState } from "react"
import { useConnectivity } from "./hooks/useConnectivity"
import AppShell from "./components/AppShell"
import DemoMode from "./components/DemoMode"
import LoginScreen from "./components/LoginScreen"
import OfficerDashboard from "./components/OfficerDashboard"

/**
 * Top-level app router between the farmer experience and the officer
 * ("Agri Intelligence") dashboard, sharing connectivity state.
 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [view, setView] = useState("farmer")
  const [showDemo, setShowDemo] = useState(false)
  const { isOnline } = useConnectivity()

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <>
      {view === "officer" ? (
        <OfficerDashboard onBack={() => setView("farmer")} online={isOnline} />
      ) : (
        <AppShell onOpenOfficer={() => setView("officer")} onOpenDemo={() => setShowDemo(true)} />
      )}

      {showDemo && <DemoMode onClose={() => setShowDemo(false)} />}
    </>
  )
}

export default App