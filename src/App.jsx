import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'

// Screens
import Home from './screens/Home'
import Onboarding from './screens/Onboarding'
import SOSMode from './screens/SOSMode'
import NearbyServices from './screens/NearbyServices'
import FirstAid from './screens/FirstAid'
import Settings from './screens/Settings'
import MedicalProfile from './screens/MedicalProfile'
import IncidentVault from './screens/IncidentVault'
import CommunityHub from './screens/CommunityHub'
import RecoveryTimeline from './screens/RecoveryTimeline'
import TrainingAcademy from './screens/TrainingAcademy'
import PreTripRisk from './screens/PreTripRisk'
import BloodBank from './screens/BloodBank'
import VehicleDashboard from './screens/VehicleDashboard'

import CrashSentinelOverlay from './components/sos/CrashSentinelOverlay'
import AppIntelligence from './components/shared/AppIntelligence'

// Shared Components
import SOSButton from './components/sos/SOSButton'

function App() {
  const { hasCompletedOnboarding, isDarkMode, setIsOnline } = useAppStore()

  useEffect(() => {
    // Sync dark mode class
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Network status listener
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isDarkMode, setIsOnline])

  return (
    <BrowserRouter>
      <div className="relative mx-auto min-h-screen max-w-md overflow-hidden border-x border-smoke-500/20 bg-asphalt-900 font-body text-smoke-100 shadow-2xl">
        <Routes>
          <Route path="/" element={hasCompletedOnboarding ? <Home /> : <Navigate to="/onboarding" />} />
          <Route path="/onboarding" element={!hasCompletedOnboarding ? <Onboarding /> : <Navigate to="/" />} />
          <Route path="/sos" element={<SOSMode />} />
          <Route path="/services" element={<NearbyServices />} />
          <Route path="/first-aid" element={<FirstAid />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/medical-profile" element={<MedicalProfile />} />
          <Route path="/incident-vault" element={<IncidentVault />} />
          <Route path="/community" element={<CommunityHub />} />
          {/* Layer 3 Screens */}
          <Route path="/recovery" element={<RecoveryTimeline />} />
          <Route path="/training" element={<TrainingAcademy />} />
          <Route path="/trip-risk" element={<PreTripRisk />} />
          <Route path="/blood-bank" element={<BloodBank />} />
          <Route path="/vehicle" element={<VehicleDashboard />} />
        </Routes>
        
        {/* Global SOS Button (always visible unless in SOS mode or onboarding) */}
        {hasCompletedOnboarding && <SOSButton />}
        {hasCompletedOnboarding && <CrashSentinelOverlay />}
        {hasCompletedOnboarding && <AppIntelligence />}
      </div>
    </BrowserRouter>
  )
}

export default App
