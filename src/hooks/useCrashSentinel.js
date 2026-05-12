import { useEffect, useRef, useState } from 'react'

const CRASH_G_THRESHOLD = 3.0
const SPEED_DROP_THRESHOLD = 40
const SPEED_DROP_TIME = 2000

export const requestMotionPermission = async () => {
  if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const permissionState = await DeviceMotionEvent.requestPermission();
      return permissionState === 'granted';
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  return true; // Auto-granted for non-iOS or older devices
}

export function useCrashSentinel({ enabled = true, onCrash }) {
  const motionHistory = useRef([])
  const speedHistory = useRef([])
  const lastOrientation = useRef({ ts: 0, value: null })
  const [suppressed, setSuppressed] = useState(false)
  const armed = enabled && !suppressed

  useEffect(() => {
    if (!armed) return undefined

    const handleOrientation = (event) => {
      const value = `${Math.round(event.alpha || 0)}:${Math.round(event.beta || 0)}:${Math.round(event.gamma || 0)}`
      if (lastOrientation.current.value && lastOrientation.current.value !== value) {
        lastOrientation.current.ts = Date.now()
      }
      lastOrientation.current.value = value
    }

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity || event.acceleration || {}
      const x = acc.x || 0
      const y = acc.y || 0
      const z = acc.z || 0
      const gForce = Math.sqrt(x * x + y * y + z * z) / 9.80665
      const sample = { ts: Date.now(), gForce: Number(gForce.toFixed(2)), x, y, z }
      motionHistory.current = [...motionHistory.current, sample].slice(-100)
      if (gForce > CRASH_G_THRESHOLD) evaluateCrash(sample)
    }

    const evaluateCrash = (sample) => {
      const now = Date.now()
      const recentSpeeds = speedHistory.current.filter((speed) => now - speed.ts < SPEED_DROP_TIME)
      const maxSpeed = Math.max(...recentSpeeds.map((speed) => speed.kmh), 0)
      const currentSpeed = recentSpeeds.at(-1)?.kmh || 0
      const speedDrop = maxSpeed - currentSpeed
      const pickedUpRecently = now - lastOrientation.current.ts < 1200
      const continuedMovement = currentSpeed > 10
      const confidence = (sample.gForce / CRASH_G_THRESHOLD) * 0.45
        + (speedDrop / SPEED_DROP_THRESHOLD) * 0.4
        + (pickedUpRecently ? -0.25 : 0)
        + (continuedMovement ? -0.2 : 0.2)

      if (speedDrop > SPEED_DROP_THRESHOLD && confidence > 0.75) {
        setSuppressed(true)
        onCrash?.({
          confidence: Number(confidence.toFixed(2)),
          motionHistory: motionHistory.current,
          speedHistory: speedHistory.current,
        })
      }
    }

    let watchId
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition((position) => {
        speedHistory.current = [
          ...speedHistory.current,
          { ts: Date.now(), kmh: Math.max(0, (position.coords.speed || 0) * 3.6), accuracy: position.coords.accuracy },
        ].slice(-300)
      })
    }

    window.addEventListener('devicemotion', handleMotion)
    window.addEventListener('deviceorientation', handleOrientation)
    return () => {
      window.removeEventListener('devicemotion', handleMotion)
      window.removeEventListener('deviceorientation', handleOrientation)
      if (watchId) navigator.geolocation.clearWatch(watchId)
    }
  }, [armed, onCrash])

  return { armed, setArmed: (next) => setSuppressed(!next) }
}
