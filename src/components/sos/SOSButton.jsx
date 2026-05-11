import { useNavigate, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Ambulance } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

export default function SOSButton() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isSosActive, triggerSos } = useAppStore()
  const reduceMotion = useReducedMotion()

  // Don't show if already in SOS mode or on settings/first-aid (maybe keep on all except SOS and onboarding)
  if (isSosActive || location.pathname === '/sos' || location.pathname === '/onboarding') {
    return null
  }

  const handleSosClick = () => {
    if ('vibrate' in navigator) navigator.vibrate(50)
    triggerSos()
    navigate('/sos')
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center">
      <div className="group relative flex h-[104px] w-[104px] items-center justify-center">
        <div
          className={`absolute h-[88px] w-[88px] rounded-full bg-[rgba(232,54,26,0.3)] ${reduceMotion ? '' : 'animate-sos-pulse group-hover:animate-sos-pulse-fast'}`}
          aria-hidden="true"
        />
        <div
          className={`absolute h-[104px] w-[104px] rounded-full bg-[rgba(232,54,26,0.15)] ${reduceMotion ? '' : 'animate-sos-pulse group-hover:animate-sos-pulse-fast'}`}
          style={{ animationDelay: '300ms' }}
          aria-hidden="true"
        />
        <motion.button
          whileHover={reduceMotion ? undefined : { boxShadow: 'var(--shadow-glow-red-strong)' }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          onClick={handleSosClick}
          className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full border border-smoke-100/20 bg-emergency text-smoke-100 shadow-glow-red transition-shadow"
          aria-label="Activate SOS emergency mode"
          title="Activate SOS"
        >
          <Ambulance size={28} aria-hidden="true" />
        </motion.button>
      </div>
    </div>
  )
}
