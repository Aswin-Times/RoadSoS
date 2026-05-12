import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Navigation, Clock, ShieldCheck, Search, Filter, ChevronRight, Hospital, Shield, Ambulance, Wrench, RefreshCw } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import StatusBar from '../components/shared/StatusBar'
import { useNearbyServices } from '../hooks/useNearbyServices'
import { generateDirectionsLink } from '../utils/shareUtils'
import { cardItem, staggerContainer } from '../utils/variants'

const serviceStyles = {
  hospital: { color: '#E8361A', bg: 'bg-emergency/10', text: 'text-emergency', icon: Hospital, label: 'Hospital' },
  police: { color: '#2563EB', bg: 'bg-blue-500/10', text: 'text-blue-400', icon: Shield, label: 'Police' },
  ambulance: { color: '#F59E0B', bg: 'bg-warning/10', text: 'text-warning', icon: Ambulance, label: 'Ambulance' },
  towing: { color: '#8A8480', bg: 'bg-smoke-300/10', text: 'text-smoke-200', icon: Wrench, label: 'Towing' },
  default: { color: '#8A8480', bg: 'bg-smoke-300/10', text: 'text-smoke-200', icon: Hospital, label: 'Service' },
}

function formatDistance(distance) {
  const value = Number(distance)
  if (!Number.isFinite(value)) return 'nearby'
  return value >= 1 ? `${value.toFixed(1)} km` : `${Math.round(value * 1000)} m`
}

function formatPhone(phone) {
  if (!phone) return 'NO NUMBER'
  const raw = String(phone).replace(/[^\d+]/g, '')
  if (raw.startsWith('+91') && raw.length >= 13) {
    return `${raw.slice(0, 3)} ${raw.slice(3, 8)} ${raw.slice(8, 13)}`
  }
  return String(phone)
}

function SkeletonServiceCard() {
  return (
    <div className="service-card min-h-[150px] p-card-pad">
      <div className="absolute inset-y-0 left-0 w-1 bg-asphalt-400" />
      <div className="flex gap-3">
        <div className="h-11 w-11 rounded-full shimmer-bg" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-4/5 rounded-sharp shimmer-bg" />
          <div className="h-4 w-1/2 rounded-sharp shimmer-bg" />
        </div>
        <div className="h-7 w-20 rounded-pill shimmer-bg" />
      </div>
      <div className="mt-4 h-[58px] rounded-sharp shimmer-bg" />
    </div>
  )
}

function ServiceCard({ service, reduceMotion }) {
  const style = serviceStyles[service.type] || serviceStyles.default
  const Icon = style.icon
  const hasPhone = Boolean(service.phone)
  const phoneLabel = formatPhone(service.phone)
  const distanceLabel = formatDistance(service.distance)
  const completeData = Boolean(service.name && service.lat && service.lng && service.type)
  const operator = service.tags?.operator || service.tags?.operator_type
  const ownership = operator && String(operator).toLowerCase().includes('gov') ? 'Government' : operator ? 'Private' : null

  const handleCall = (event) => {
    if (!hasPhone) {
      event.preventDefault()
      if ('vibrate' in navigator) navigator.vibrate([50, 50, 50])
      return
    }
    if ('vibrate' in navigator) navigator.vibrate([100])
  }

  return (
    <motion.article
      variants={reduceMotion ? undefined : cardItem}
      className="service-card active:scale-[0.98]"
      style={{ '--urgency': style.color }}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-[var(--urgency)] shadow-[0_0_16px_var(--urgency)]" aria-hidden="true" />
      <div className="p-card-pad pb-0">
        <div className="flex gap-3 pr-20">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
            <Icon size={22} className={style.text} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              {ownership && (
                <span className="rounded-pill border border-smoke-500/20 px-2 py-0.5 text-[11px] text-smoke-300">
                  {ownership}
                </span>
              )}
              {completeData && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-safe/10 px-2 py-0.5 text-[11px] text-safe">
                  <ShieldCheck size={12} aria-hidden="true" /> Verified
                </span>
              )}
            </div>
            <h3 className="text-heading line-clamp-2 text-smoke-100">{service.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-smoke-300">
              <span className="text-body capitalize text-smoke-300">{style.label}</span>
              <span aria-hidden="true">•</span>
              <span className="text-coords text-emergency" aria-label={`${distanceLabel.replace('km', 'kilometers').replace('m', 'meters')} away`}>
                {distanceLabel}
              </span>
            </div>
          </div>
        </div>
        <span className="absolute right-4 top-4 rounded-pill border border-safe/25 bg-safe-muted px-3 py-1 text-label text-safe">
          Open 24h
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_56px] border-t border-smoke-500/15">
        <a
          href={hasPhone ? `tel:${service.phone}` : '#'}
          onClick={handleCall}
          className={`flex min-h-[58px] flex-col justify-center px-card-pad ${hasPhone ? 'bg-emergency text-smoke-100' : 'bg-asphalt-500 text-smoke-300'}`}
          aria-label={hasPhone ? `Call ${service.name} at ${phoneLabel}` : `${service.name} has no phone number`}
        >
          <span className="text-label text-smoke-200">Call</span>
          <span className="phone-number">{phoneLabel}</span>
        </a>
        <a
          href={generateDirectionsLink(service.lat, service.lng)}
          target="_blank"
          rel="noreferrer"
          onClick={() => { if ('vibrate' in navigator) navigator.vibrate(50) }}
          className="flex min-h-[58px] items-center justify-center border-l border-smoke-500/15 bg-asphalt-600 text-smoke-100"
          aria-label={`Navigate to ${service.name}`}
          title="Navigate"
        >
          <Navigation size={18} className="hidden sm:block" aria-hidden="true" />
          <ChevronRight size={22} className="sm:hidden" aria-hidden="true" />
        </a>
      </div>
    </motion.article>
  )
}

export default function NearbyServices() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'all'
  
  const [activeTab, setActiveTab] = useState(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { services, loading, usingCache } = useNearbyServices(10000) // 10km radius
  const reduceMotion = useReducedMotion()

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'hospital', label: 'Hospitals' },
    { id: 'ambulance', label: 'Ambulance' },
    { id: 'police', label: 'Police' },
    { id: 'towing', label: 'Towing' },
  ]

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesTab = activeTab === 'all' || service.type === activeTab
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (service.tags && service.tags.amenity && service.tags.amenity.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesTab && matchesSearch
    })
  }, [services, activeTab, searchQuery])

  return (
    <div className="flex h-screen w-full flex-col bg-asphalt-900 text-smoke-100">
      <StatusBar />
      
      {/* Header */}
      <div className="sticky top-8 z-50 border-b border-smoke-500/20 bg-asphalt-700 px-gutter py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/')} className="-ml-2 flex h-touch w-touch items-center justify-center rounded-full active:bg-asphalt-500" aria-label="Back to home" title="Back">
            <ArrowLeft size={24} aria-hidden="true" />
          </button>
          <h1 className="text-display-md">Nearby Services</h1>
        </div>
        
        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-smoke-300" aria-hidden="true" />
            <input 
              type="text" 
              placeholder="Search hospitals, police..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-touch w-full rounded-card border border-smoke-500/25 bg-asphalt-900 py-2.5 pl-10 pr-4 text-body text-smoke-100 placeholder:text-smoke-400 focus:border-emergency focus:outline-none"
            />
          </div>
          <button className="flex h-touch w-touch items-center justify-center rounded-card border border-smoke-500/25 bg-asphalt-500" aria-label="Filter services" title="Filter">
            <Filter size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-touch whitespace-nowrap rounded-pill px-4 text-label transition-colors ${activeTab === tab.id ? 'bg-emergency text-smoke-100 shadow-glow-red' : 'bg-asphalt-500 text-smoke-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bottom-fade relative z-0 flex-1 overflow-y-auto px-gutter py-4">
        {loading && services.length === 0 ? (
          <div className="flex flex-col gap-4" aria-label="Loading nearby services">
            {[0, 1, 2].map((item) => <SkeletonServiceCard key={item} />)}
          </div>
        ) : filteredServices.length > 0 ? (
          <motion.div
            variants={reduceMotion ? undefined : staggerContainer}
            initial={reduceMotion ? undefined : "hidden"}
            animate={reduceMotion ? undefined : "visible"}
            className="flex flex-col gap-4"
          >
            {usingCache && (
              <div className="flex min-h-touch items-center gap-2 rounded-card border border-warning/25 bg-warning-muted px-3 text-body text-warning">
                <Clock size={16} aria-hidden="true" /> Showing cached data. Connect to internet for live updates.
              </div>
            )}
            
            {filteredServices.map(service => (
              <ServiceCard key={service.id} service={service} reduceMotion={reduceMotion} />
            ))}
          </motion.div>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center text-smoke-300">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-smoke-500/20 bg-asphalt-700">
              <Search size={34} className="text-emergency" aria-hidden="true" />
            </div>
            <p className="text-heading text-smoke-100">No {activeTab === 'all' ? 'services' : activeTab + 's'} found nearby.</p>
            <p className="mt-2 text-body text-smoke-300">Try another category or check your connection.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-ghost mt-5 gap-2 px-4"
            >
              <RefreshCw size={16} aria-hidden="true" /> Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
