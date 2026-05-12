import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ShieldAlert, Settings as SettingsIcon, Wrench, BookOpen, Hospital, ChevronRight, Mic, Send, Users, Droplets, Car, GraduationCap, MapPin, Clock } from 'lucide-react'
import MapView from '../components/map/MapView'
import StatusBar from '../components/shared/StatusBar'
import { useAppStore } from '../store/useAppStore'
import { runTriage, generateSosMessage } from '../utils/aiCopilot'
import { useNearbyServices } from '../hooks/useNearbyServices'

export default function Home() {
  const navigate = useNavigate()
  const { location, setLocation, setLastTriage, setSosDraft, medicalProfile, bloodGroup } = useAppStore()
  const [incidentText, setIncidentText] = useState('')
  const [triageBusy, setTriageBusy] = useState(false)
  
  // Quick Actions Data — expanded for Layer 3
  const quickActions = [
    { id: 'hospital', label: 'Trauma Centre', icon: <Hospital size={24} />, color: 'text-emergency', path: '/services?tab=hospital' },
    { id: 'ambulance', label: 'Ambulance', icon: <Activity size={24} />, color: 'text-warning', path: '/services?tab=ambulance' },
    { id: 'police', label: 'Police', icon: <ShieldAlert size={24} />, color: 'text-blue-400', path: '/services?tab=police' },
    { id: 'firstaid', label: 'First Aid', icon: <BookOpen size={24} />, color: 'text-safe', path: '/first-aid' },
    { id: 'blood', label: 'Blood Bank', icon: <Droplets size={24} />, color: 'text-emergency', path: '/blood-bank' },
    { id: 'triprisk', label: 'Trip Risk', icon: <MapPin size={24} />, color: 'text-warning', path: '/trip-risk' },
    { id: 'training', label: 'Training', icon: <GraduationCap size={24} />, color: 'text-blue-300', path: '/training' },
    { id: 'vehicle', label: 'Vehicle', icon: <Car size={24} />, color: 'text-blue-400', path: '/vehicle' },
    { id: 'recovery', label: 'Recovery', icon: <Clock size={24} />, color: 'text-purple-400', path: '/recovery' },
    { id: 'community', label: 'Community', icon: <Users size={24} />, color: 'text-safe', path: '/community' },
  ]

  const [locationStatus, setLocationStatus] = useState('pending')
  const { services, loading, error } = useNearbyServices(5000)

  useEffect(() => {
    if (location) {
      setLocationStatus('granted')
      return
    }
    if (!('geolocation' in navigator)) {
      setLocationStatus('unsupported')
      return
    }
    
    setLocationStatus('pending')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus('granted')
        setLocation(position.coords.latitude, position.coords.longitude, position.coords.accuracy)
      },
      (error) => {
        console.error("Location error:", error)
        if (error.code === 1) {
          setLocationStatus('denied')
        } else {
          setLocationStatus('denied')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [location, setLocation])

  const submitTriage = async () => {
    if (!incidentText.trim() || triageBusy) return
    setTriageBusy(true)
    const triage = await runTriage(incidentText)
    setLastTriage({ ...triage, description: incidentText })
    setSosDraft(generateSosMessage({
      coords: location,
      injuryDesc: `${triage.urgency} ${triage.category}`,
      nearestHospital: services.find((service) => service.type === 'hospital'),
      bloodGroup,
      medicalSummary: medicalProfile.aiSummary,
    }))
    setTriageBusy(false)
    navigate(`/first-aid?module=${triage.first_aid_module}`)
  }

  const dictate = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = navigator.language || 'en-IN'
    recognition.onresult = (event) => setIncidentText(event.results[0][0].transcript)
    recognition.start()
  }

  return (
    <div className="flex h-screen w-full flex-col bg-asphalt-900">
      <StatusBar />
      
      {/* Settings Icon */}
      <button 
        onClick={() => navigate('/settings')}
        className="absolute right-4 top-12 z-[400] flex h-touch w-touch items-center justify-center rounded-full border border-smoke-500/25 bg-asphalt-700/85 text-smoke-100 shadow-card backdrop-blur-md"
        aria-label="Open settings"
        title="Settings"
      >
        <SettingsIcon size={20} aria-hidden="true" />
      </button>

      {/* Top Half: Map */}
      <div className="h-[45vh] relative z-0">
        {locationStatus === 'denied' || locationStatus === 'unsupported' ? (
          <div className="flex h-full items-center justify-center bg-asphalt-800 px-4">
            <div className="rounded-card border border-emergency/20 bg-asphalt-700 p-6 text-center shadow-lg">
              <MapPin size={32} className="mx-auto mb-3 text-smoke-400" />
              <p className="mb-4 text-sm text-smoke-300">
                Location access denied. Enable it in your browser settings to find nearby services.
              </p>
              <button 
                onClick={() => window.open('app-settings:')} 
                className="btn-ghost mx-auto border border-brand-500 text-brand-500"
              >
                Open Settings
              </button>
            </div>
          </div>
        ) : (
          <>
            <MapView services={services} />
            {locationStatus === 'pending' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[350] flex items-center gap-2 rounded-full bg-asphalt-800/90 px-4 py-2 text-xs font-bold text-brand-400 shadow-lg backdrop-blur animate-pulse border border-brand-500/30">
                <div className="h-2 w-2 rounded-full bg-brand-500 animate-ping" />
                Waiting for location...
              </div>
            )}
          </>
        )}
        
        {/* Gradient Overlay for smooth transition */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[300] h-16 bg-gradient-to-t from-asphalt-900 to-transparent"></div>
      </div>

      {/* Bottom Half: Content */}
      <div className="slide-up relative z-10 -mt-4 flex-1 overflow-y-auto rounded-t-card bg-asphalt-900 px-gutter pb-32 pt-6">
        <section className="mb-5 rounded-card border border-emergency/25 bg-asphalt-700 p-card-pad shadow-card">
          <label className="text-label text-emergency" htmlFor="triage-input">Describe what happened</label>
          <div className="mt-3 flex gap-2">
            <input
              id="triage-input"
              value={incidentText}
              onChange={(event) => setIncidentText(event.target.value)}
              className="min-h-touch flex-1 rounded-sharp border border-smoke-500/25 bg-asphalt-900 px-3 text-body"
              placeholder="My leg is bent sideways..."
            />
            <button onClick={dictate} className="btn-ghost w-touch" aria-label="Speak incident description" title="Speak"><Mic size={18} /></button>
            <button onClick={submitTriage} className="btn-primary w-touch" aria-label="Run triage" title="Run triage">{triageBusy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-smoke-100 border-t-transparent" /> : <Send size={18} />}</button>
          </div>
        </section>

        <h2 className="text-label mb-4 text-smoke-300">Quick Actions</h2>
        
        {/* Horizontal Scroll Quick Actions — expanded */}
        <div className="flex overflow-x-auto gap-3 pb-4 snap-x no-scrollbar">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => navigate(action.path)}
              className="glow-border flex h-[76px] w-[76px] flex-shrink-0 snap-center flex-col items-center justify-center gap-1.5 rounded-card border border-smoke-500/20 bg-asphalt-700 transition-all hover:-translate-y-0.5 hover:bg-asphalt-500 active:scale-95"
              aria-label={action.label}
            >
              <div className={action.color}>{action.icon}</div>
              <span className="px-0.5 text-center text-[11px] leading-tight text-smoke-200">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <h2 className="mb-4 flex items-center justify-between">
            <span>NEARBY SERVICES</span>
            <button onClick={() => navigate('/services')} className="flex min-h-touch items-center gap-1 text-label text-emergency">
              View All <ChevronRight size={16} aria-hidden="true" />
            </button>
          </h2>
          
          <div className="flex flex-col gap-3">
            {loading ? (
              <>
                <div className="h-20 w-full animate-pulse rounded-card bg-asphalt-700/50" />
                <div className="h-20 w-full animate-pulse rounded-card bg-asphalt-700/50" />
                <div className="h-20 w-full animate-pulse rounded-card bg-asphalt-700/50" />
              </>
            ) : error ? (
              <div className="rounded-card border border-emergency/40 bg-emergency/10 p-4 text-emergency text-sm">
                Failed to load nearby services. Displaying cached data if available.
              </div>
            ) : !location ? (
              <div className="rounded-card border border-warning/40 bg-warning/10 p-4 text-warning text-sm">
                Location required to find nearby services.
              </div>
            ) : services.length === 0 ? (
              <div className="rounded-card border border-smoke-500/40 bg-asphalt-700 p-4 text-smoke-300 text-sm">
                No services found nearby.
              </div>
            ) : (
              services.slice(0, 3).map(service => (
                <div key={service.id} className="service-card flex items-center justify-between p-card-pad">
                  <div className="absolute inset-y-0 left-0 w-1 bg-emergency" aria-hidden="true" />
                  <div>
                    <h3 className="text-heading">{service.name}</h3>
                    <p className="text-body capitalize text-smoke-300">{service.type}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-coords text-emergency">{service.distance} km</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
