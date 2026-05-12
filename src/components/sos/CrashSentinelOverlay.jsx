import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useCrashSentinel, requestMotionPermission } from '../../hooks/useCrashSentinel'
import { useAppStore } from '../../store/useAppStore'
import { sealEvidencePackage } from '../../utils/evidenceVault'

export default function CrashSentinelOverlay() {
  const navigate = useNavigate()
  const route = useLocation()
  const { location, triggerSos, setTremorMode, isSosActive, motionPermissionGranted, setMotionPermissionGranted } = useAppStore()
  const [crash, setCrash] = useState(null)
  const [countdown, setCountdown] = useState(10)
  const [showPrompt, setShowPrompt] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (motionPermissionGranted === null && route.pathname !== '/onboarding') {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        setShowPrompt(true)
      } else {
        setMotionPermissionGranted(true)
      }
    }
  }, [motionPermissionGranted, setMotionPermissionGranted, route.pathname])

  const handleAllow = async () => {
    const granted = await requestMotionPermission()
    setMotionPermissionGranted(granted)
    setShowPrompt(false)
  }

  const handleDeny = () => {
    setMotionPermissionGranted(false)
    setShowPrompt(false)
  }

  const onCrash = useCallback((payload) => {
    setCrash(payload)
    setCountdown(10)
    setTremorMode(true)
    if ('vibrate' in navigator) navigator.vibrate([500, 200, 500, 200, 500])
  }, [setTremorMode])

  useCrashSentinel({ enabled: motionPermissionGranted === true && !isSosActive && route.pathname !== '/onboarding', onCrash })

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

  if (showPrompt) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
        <div className="rounded-card border border-brand-500/20 bg-asphalt-800 p-6 text-center text-smoke-100 shadow-2xl">
          <AlertTriangle size={48} className="mx-auto mb-4 text-brand-400" />
          <h2 className="mb-2 text-xl font-bold">Enable crash detection?</h2>
          <p className="mb-6 text-sm text-smoke-300">
            Road Rescue needs motion sensor access to automatically detect accidents and send SOS.
          </p>
          <div className="flex gap-3">
            <button onClick={handleDeny} className="btn-ghost flex-1 border-smoke-600">Not Now</button>
            <button onClick={handleAllow} className="btn-primary flex-1 bg-brand-600">Allow</button>
          </div>
        </div>
      </div>
    )
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
