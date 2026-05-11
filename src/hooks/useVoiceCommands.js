import { useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useNavigate } from 'react-router-dom'
import emergencyNumbers from '../data/emergency-numbers.json'
import { useAppStore } from '../store/useAppStore'

export function useVoiceCommands() {
  const navigate = useNavigate()
  const { voiceOptIn, countryCode, triggerSos, cancelSos } = useAppStore()
  const commands = useMemo(() => [
    { phrase: 'call ambulance', action: 'call' },
    { phrase: 'nearest hospital', action: 'hospital' },
    { phrase: 'start cpr', action: 'cpr' },
    { phrase: 'send sos', action: 'sos' },
    { phrase: "i'm okay", action: 'cancel' },
    { phrase: 'im okay', action: 'cancel' },
  ], [])

  useEffect(() => {
    if (!voiceOptIn) return undefined
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return undefined

    const fuse = new Fuse(commands, { keys: ['phrase'], threshold: 0.38 })
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = navigator.language || 'en-IN'

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
      if (!transcript.includes('rescue')) return
      const query = transcript.replace('rescue', '').trim()
      const match = fuse.search(query)[0]?.item
      if (!match) return
      if ('vibrate' in navigator) navigator.vibrate(80)

      if (match.action === 'call') {
        const numbers = emergencyNumbers[countryCode] || emergencyNumbers.IN
        window.location.href = `tel:${numbers.ambulance || numbers.unified}`
      }
      if (match.action === 'hospital') navigate('/services?tab=hospital')
      if (match.action === 'cpr') navigate('/first-aid?module=cpr')
      if (match.action === 'sos') {
        triggerSos()
        navigate('/sos')
      }
      if (match.action === 'cancel') cancelSos()
    }

    recognition.onerror = () => {}
    recognition.onend = () => {
      if (voiceOptIn) {
        try { recognition.start() } catch { /* already started */ }
      }
    }
    try { recognition.start() } catch { /* permission or duplicate start */ }
    return () => recognition.stop()
  }, [cancelSos, commands, countryCode, navigate, triggerSos, voiceOptIn])
}
