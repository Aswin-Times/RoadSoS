import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ShieldAlert, Navigation, ChevronRight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { setHasCompletedOnboarding, setLocation } = useAppStore()

  const handleNext = () => {
    if (step < 2) setStep(step + 1)
  }

  const handleAllowLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords.latitude, position.coords.longitude, position.coords.accuracy)
          finishOnboarding()
        },
        (error) => {
          console.error("Location error:", error)
          finishOnboarding() // Proceed anyway
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      )
    } else {
      finishOnboarding()
    }
  }

  const finishOnboarding = () => {
    setHasCompletedOnboarding(true)
    navigate('/')
  }

  const slides = [
    {
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="relative w-full max-w-[280px] h-32 mb-8">
            <svg viewBox="0 0 400 100" className="w-full h-full stroke-[var(--color-brand)] stroke-[3px] fill-transparent">
              <path 
                d="M 0 50 L 100 50 L 120 20 L 140 90 L 160 10 L 180 80 L 200 50 L 400 50" 
                strokeDasharray="1000" 
                strokeDashoffset="1000"
                style={{ animation: 'dash 3s linear forwards' }}
              />
            </svg>
            <style>{`
              @keyframes dash {
                to { stroke-dashoffset: 0; }
              }
            `}</style>
          </div>
          <h1 className="text-7xl font-display font-bold text-[var(--color-brand)] tracking-wider mb-4">ROAD RESCUE</h1>
          <p className="text-xl text-[var(--color-text-muted)] font-medium">Every second is the golden hour.</p>
        </div>
      )
    },
    {
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="flex gap-4 mb-10 text-[var(--color-brand-muted)]">
            <Activity size={48} className="animate-bounce" />
            <ShieldAlert size={48} className="animate-pulse" />
          </div>
          <h2 className="text-4xl font-display font-bold mb-6">REAL-TIME AID</h2>
          <p className="text-[var(--color-text-muted)] mb-8">
            Instant access to nearby hospitals, police, ambulances, and towing services when you need them most.
          </p>
          <div className="flex flex-col gap-4 w-full max-w-[280px] text-left">
            <div className="flex items-center gap-3 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Trauma Centres & ICU</span>
            </div>
            <div className="flex items-center gap-3 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)]">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Police Stations</span>
            </div>
          </div>
        </div>
      )
    },
    {
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="relative mb-10">
            <Navigation size={64} className="text-[var(--color-brand)] z-10 relative" />
            <div className="absolute inset-0 bg-[var(--color-brand)] rounded-full pulse-ring -z-10"></div>
          </div>
          <h2 className="text-4xl font-display font-bold mb-6">ENABLE LOCATION</h2>
          <p className="text-[var(--color-text-muted)] mb-10">
            We need your location to find the nearest emergency services and send precise SOS alerts.
          </p>
          <button 
            onClick={handleAllowLocation}
            className="w-full py-4 bg-[var(--color-brand)] text-white rounded-xl font-bold text-lg mb-4 hover:bg-red-700 active:scale-95 transition-all glow-border"
          >
            Allow Location
          </button>
          <button 
            onClick={finishOnboarding}
            className="text-[var(--color-text-muted)] text-sm underline underline-offset-4"
          >
            Skip for now
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="h-screen w-full flex flex-col bg-[var(--color-background)]">
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {slides[step].content}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer Navigation */}
      {step < 2 && (
        <div className="h-24 px-6 flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[var(--color-brand)]' : 'w-2 bg-[var(--color-surface-2)]'}`}
              />
            ))}
          </div>
          <button 
            onClick={handleNext}
            className="w-12 h-12 bg-[var(--color-surface)] rounded-full flex items-center justify-center text-white active:bg-[var(--color-surface-2)] transition-colors border border-[var(--color-border)]"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  )
}
