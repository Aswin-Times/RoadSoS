import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useCrashSentinel } from '../../hooks/useCrashSentinel'
import { useAppStore } from '../../store/useAppStore'
import { sealEvidencePackage } from '../../utils/evidenceVault'

export default function CrashSentinelOverlay() {
  const navigate = useNavigate()
  const route = useLocation()
  const { location, triggerSos, setTremorMode, isSosActive } = useAppStore()
  const [crash, setCrash] = useState(null)
  const [countdown, setCountdown] = useState(10)
  const audioRef = useRef(null)

  const onCrash = useCallback((payload) => {
    setCrash(payload)
    setCountdown(10)
    setTremorMode(true)
    if ('vibrate' in navigator) navigator.vibrate([500, 200, 500, 200, 500])
  }, [setTremorMode])

  useCrashSentinel({ enabled: !isSosActive && route.pathname !== '/onboarding', onCrash })

  useEffect(() => {
    if (!crash) return undefined
    const context = new AudioContext()
    audioRef.current = context
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = 880
    gain.gain.value = 0.04
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    const interval = setInterval(() => {
      gain.gain.value = gain.gain.value > 0 ? 0 : 0.04
    }, 240)
    return () => {
      clearInterval(interval)
      oscillator.stop()
      context.close()
    }
  }, [crash])

  useEffect(() => {
    if (!crash) return undefined
    if (countdown <= 0) {
      const incidentId = `crash-${Date.now()}`
      sealEvidencePackage({ incidentId, location, motionHistory: crash.motionHistory, speedHistory: crash.speedHistory }).finally(() => {
        triggerSos()
        navigate('/sos')
      })
      return undefined
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, crash, location, navigate, triggerSos])

  const cancel = () => {
    setCrash(null)
    setTremorMode(false)
    audioRef.current?.close?.()
  }

  if (!crash) return null

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-[#5C0000] px-gutter text-center text-smoke-100">
      <AlertTriangle size={76} className="mb-6 animate-pulse" aria-hidden="true" />
      <div className="text-label text-smoke-200">Confidence {Math.round(crash.confidence * 100)}%</div>
      <h1 className="text-display-lg mt-2">Crash Detected</h1>
      <div className="my-8 font-mono text-[96px] leading-none">{countdown}</div>
      <p className="text-body text-smoke-200">Sending SOS automatically unless cancelled.</p>
      <button onClick={cancel} className="mt-8 min-h-[72px] w-full rounded-sharp bg-smoke-100 text-label text-asphalt-900">Cancel</button>
    </div>
  )
}
