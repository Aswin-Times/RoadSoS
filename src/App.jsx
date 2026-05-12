import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { db } from './store/db'

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
import PinGate from './components/shared/PinGate'
import ErrorBoundary from './components/shared/ErrorBoundary'
import Toast from './components/shared/Toast'

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
    const handleOnline = async () => {
      setIsOnline(true)
      try {
        const queue = await db.evidence_upload_queue.toArray()
        for (const item of queue) {
          const res = await fetch('/api/evidence-backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          })
          if (res.ok) {
            await db.evidence_upload_queue.delete(item.id)
          }
        }
      } catch (err) {
        console.error('Failed to drain evidence queue', err)
      }
    }
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
          <Route path="/" element={<ErrorBoundary>{hasCompletedOnboarding ? <Home /> : <Navigate to="/onboarding" />}</ErrorBoundary>} />
          <Route path="/onboarding" element={<ErrorBoundary>{!hasCompletedOnboarding ? <Onboarding /> : <Navigate to="/" />}</ErrorBoundary>} />
          <Route path="/sos" element={<ErrorBoundary><SOSMode /></ErrorBoundary>} />
          <Route path="/services" element={<ErrorBoundary><NearbyServices /></ErrorBoundary>} />
          <Route path="/first-aid" element={<ErrorBoundary><FirstAid /></ErrorBoundary>} />
          <Route path="/settings" element={<ErrorBoundary><PinGate><Settings /></PinGate></ErrorBoundary>} />
          <Route path="/medical-profile" element={<ErrorBoundary><PinGate><MedicalProfile /></PinGate></ErrorBoundary>} />
          <Route path="/incident-vault" element={<ErrorBoundary><PinGate><IncidentVault /></PinGate></ErrorBoundary>} />
          <Route path="/community" element={<ErrorBoundary><CommunityHub /></ErrorBoundary>} />
          {/* Layer 3 Screens */}
          <Route path="/recovery" element={<ErrorBoundary><RecoveryTimeline /></ErrorBoundary>} />
          <Route path="/training" element={<ErrorBoundary><TrainingAcademy /></ErrorBoundary>} />
          <Route path="/trip-risk" element={<ErrorBoundary><PreTripRisk /></ErrorBoundary>} />
          <Route path="/blood-bank" element={<ErrorBoundary><PinGate><BloodBank /></PinGate></ErrorBoundary>} />
          <Route path="/vehicle" element={<ErrorBoundary><VehicleDashboard /></ErrorBoundary>} />
        </Routes>
        
        {/* Global Components */}
        <Toast />
        {/* Global SOS Button (always visible unless in SOS mode or onboarding) */}
        {hasCompletedOnboarding && <SOSButton />}
        {hasCompletedOnboarding && <CrashSentinelOverlay />}
        {hasCompletedOnboarding && <AppIntelligence />}
      </div>
    </BrowserRouter>
  )
}

export default App
