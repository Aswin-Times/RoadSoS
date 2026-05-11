import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, MessageSquare, Copy, AlertTriangle, ShieldPlus, Activity, Navigation } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useAppStore } from '../store/useAppStore'
import { generateEmergencyMessage, shareViaWhatsApp, shareViaSMS, vibrateDevice } from '../utils/shareUtils'
import emergencyNumbers from '../data/emergency-numbers.json'

export default function SOSMode() {
  const navigate = useNavigate()
  const { location, cancelSos, sosStartTime, countryCode, emergencyContacts, sosDraft } = useAppStore()
  const reduceMotion = useReducedMotion()
  
  const [countdown, setCountdown] = useState(3)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Nearest mock hospital for demo
  const mockHospital = { name: "City Trauma Centre", distance: 1.2 }
  const localNumbers = emergencyNumbers[countryCode] || emergencyNumbers['US']

  const handleConfirm = useCallback(() => {
    setIsConfirmed(true)
    vibrateDevice([200, 100, 200])
    
    // Auto-dial logic (in a real app we'd use a tel: link, here we just show it)
    // window.open(`tel:${localNumbers.unified || localNumbers.ambulance}`, '_self')
  }, [])

  useEffect(() => {
    // Phase 1: Countdown
    if (isConfirmed) return undefined
    const timer = setTimeout(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1)
      } else {
        handleConfirm()
      }
    }, countdown > 0 ? 1000 : 0)
    return () => clearTimeout(timer)
  }, [countdown, isConfirmed, handleConfirm])

  useEffect(() => {
    // Phase 2: Elapsed Time
    if (isConfirmed && sosStartTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - sosStartTime) / 1000))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isConfirmed, sosStartTime])

  const handleCancel = () => {
    cancelSos()
    navigate('/')
  }

  const copyCoords = () => {
    if (location) {
      navigator.clipboard.writeText(`${location.lat}, ${location.lng}`)
      alert("Coordinates copied")
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `00:${m}:${s}`
  }

  const message = sosDraft || (location ? generateEmergencyMessage(location, mockHospital, mockHospital.distance) : 'EMERGENCY! I need help.')

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#5C0000] text-smoke-100">
      <div className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(92,0,0,0)_0%,rgba(0,0,0,0.62)_100%)] ${reduceMotion ? '' : 'animate-breathe'}`} aria-hidden="true" />
      <div className="pointer-events-none absolute left-0 right-0 top-5 z-40 text-center text-label text-smoke-100">ROAD RESCUE</div>

      <AnimatePresence mode="wait">
        {!isConfirmed ? (
          <motion.div 
            key="countdown"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            className="relative z-10 flex flex-1 flex-col items-center justify-center px-gutter"
            aria-live="assertive"
          >
            <AlertTriangle size={80} className="mb-8 animate-pulse text-smoke-100" aria-hidden="true" />
            <h1 className="text-display-lg mb-4 text-smoke-100">Sending SOS</h1>
            <div className="mb-12 font-mono text-[120px] leading-none tabular-nums text-smoke-100">
              {countdown}
            </div>
            
            <button 
              onClick={handleCancel}
              className="btn-ghost px-10"
            >
              CANCEL
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex flex-1 flex-col overflow-y-auto px-gutter pb-24 pt-20"
          >
            {/* Golden Hour Timer */}
            <div className="mb-6 text-center" aria-live="assertive">
              <div className="text-label mb-3 text-smoke-200">Time Since Incident</div>
              <div className="font-mono text-[64px] leading-none tracking-normal text-smoke-100 tabular-nums">
                {formatTime(elapsedTime)}
              </div>
            </div>
            <div className="mb-5 h-px w-full bg-smoke-300/30" />

            {/* Emergency Actions */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <a href={`tel:${localNumbers.unified || localNumbers.ambulance}`} className="flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-card border border-smoke-500/20 bg-emergency p-4 text-smoke-100 shadow-glow-red transition-transform active:scale-95">
                <Phone size={32} fill="currentColor" aria-hidden="true" />
                <span className="text-label">Call {localNumbers.unified || localNumbers.ambulance}</span>
              </a>
              <button 
                onClick={() => vibrateDevice([100, 50, 100])} 
                className="flex min-h-[112px] flex-col items-center justify-center gap-2 rounded-card border border-smoke-500/20 bg-asphalt-700 p-4 transition-transform active:scale-95"
              >
                <ShieldPlus size={32} aria-hidden="true" />
                <span className="text-label text-center">Sound Alarm</span>
              </button>
            </div>

            {/* Location Card */}
            <div className="mb-4 rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <h2 className="text-label mb-3 flex items-center gap-2 text-smoke-300">
                <Navigation size={16} aria-hidden="true" /> My Exact Location
              </h2>
              {location ? (
                <>
                  <div className="mb-4 flex items-center justify-between rounded-sharp border border-smoke-500/15 bg-asphalt-900 p-3">
                    <span className="text-coords select-text">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                    <button onClick={copyCoords} className="flex h-touch w-touch items-center justify-center rounded-sharp bg-smoke-100/10 active:bg-smoke-100/20" aria-label="Copy coordinates" title="Copy coordinates"><Copy size={16} aria-hidden="true" /></button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button onClick={() => shareViaWhatsApp(message)} className="btn-ghost gap-2 rounded-card border-safe/40 text-safe active:scale-95">
                      <MessageCircle size={18} aria-hidden="true" /> WhatsApp
                    </button>
                    <button onClick={() => shareViaSMS(message)} className="btn-ghost gap-2 rounded-card border-blue-400/40 text-blue-300 active:scale-95">
                      <MessageSquare size={18} aria-hidden="true" /> SMS
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center text-body text-smoke-300 animate-pulse">Acquiring GPS lock...</div>
              )}
            </div>

            {/* Emergency Contacts */}
            {emergencyContacts.length > 0 && (
              <div className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                <h2 className="text-label mb-3 text-smoke-300">Emergency Contacts</h2>
                <div className="flex flex-col gap-2">
                  {emergencyContacts.map(contact => (
                    <a key={contact.id} href={`tel:${contact.phone}`} className="flex min-h-touch items-center justify-between rounded-sharp bg-smoke-100/5 p-3 active:bg-smoke-100/10">
                      <div>
                        <div className="text-heading">{contact.name}</div>
                        <div className="text-caption">{contact.relationship}</div>
                      </div>
                      <div className="flex h-touch w-touch items-center justify-center rounded-full bg-smoke-100/10">
                        <Phone size={16} aria-hidden="true" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Hospital Pre-Alert */}
            <button className="btn-ghost mt-4 w-full gap-2 border-dashed border-emergency/40 text-emergency">
              <Activity size={18} aria-hidden="true" />
              Pre-alert Nearest Hospital
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={handleCancel} className="absolute bottom-6 left-1/2 z-50 min-h-touch -translate-x-1/2 px-4 text-caption text-smoke-300">
        Cancel
      </button>
    </div>
  )
}
