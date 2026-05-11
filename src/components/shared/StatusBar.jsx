import { RefreshCw, RotateCw } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useAppStore } from '../../store/useAppStore'

export default function StatusBar() {
  const { isOnline, locationAccuracy } = useAppStore()
  const reduceMotion = useReducedMotion()
  const gpsText = locationAccuracy ? `GPS +/- ${Math.round(locationAccuracy)}m` : 'GPS locating'

  return (
    <div
      className={`sticky top-0 z-[1000] flex h-8 w-full items-center justify-between border-b border-smoke-500/20 bg-asphalt-700 px-gutter text-caption ${isOnline ? 'border-l-2 border-l-safe' : 'border-l-2 border-l-emergency'}`}
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {isOnline ? (
          <motion.div
            key="online"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <span className="text-label text-safe">● LIVE</span>
          </motion.div>
        ) : (
          <motion.div
            key="offline"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <RefreshCw size={13} className={reduceMotion ? 'text-emergency' : 'animate-slow-spin text-emergency'} aria-hidden="true" />
            <span className={reduceMotion ? 'text-label text-emergency' : 'text-label text-emergency animate-pulse'}>◉ OFFLINE</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-1 min-h-6 rounded-sharp border border-smoke-500/30 px-2 text-[12px] text-smoke-200"
            >
              tap to retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 text-smoke-300">
        <RotateCw size={12} aria-hidden="true" />
        <span className="text-coords text-[12px]">{gpsText}</span>
      </div>
    </div>
  )
}
