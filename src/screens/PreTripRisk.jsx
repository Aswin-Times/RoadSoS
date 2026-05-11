import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Navigation, AlertTriangle, Cloud, Eye, Gauge, Shield, Clock, Thermometer } from 'lucide-react'
import StatusBar from '../components/shared/StatusBar'
import { calculateTripRisk, getRouteHazards, getAqiAlert, assessFloodRisk } from '../utils/hazardIntel'

const ROUTE_TYPES = [
  { id: 'NH', label: 'National Highway' },
  { id: 'SH', label: 'State Road' },
  { id: 'district', label: 'District Road' },
  { id: 'urban', label: 'Urban Road' },
]

export default function PreTripRisk() {
  const navigate = useNavigate()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [routeType, setRouteType] = useState('NH')
  const [departureTime, setDepartureTime] = useState(new Date().toISOString().slice(0, 16))
  const [result, setResult] = useState(null)

  const analyze = () => {
    const weatherCode = [800, 500, 701, 200, 600][Math.floor(Math.random() * 5)]
    const score = calculateTripRisk({ departureTime, routeType, weatherCode })
    const hazards = getRouteHazards({ departureTime, weatherCode, routeType })
    const aqi = Math.floor(Math.random() * 300) + 50
    const aqiAlert = getAqiAlert(aqi)
    const rainfall = Math.floor(Math.random() * 80)
    const flood = assessFloodRisk(rainfall)
    setResult({ score, hazards, weatherCode, aqi, aqiAlert, rainfall, flood })
  }

  const getScoreColor = (s) => {
    if (s <= 3) return '#22C55E'
    if (s <= 5) return '#3B82F6'
    if (s <= 7) return '#F59E0B'
    return '#E8361A'
  }

  const weatherLabel = (code) => {
    if (code >= 200 && code < 300) return '⛈ Thunderstorm'
    if (code >= 500 && code < 600) return '🌧 Rain'
    if (code >= 600 && code < 700) return '❄️ Snow'
    if (code >= 700 && code < 800) return '🌫 Fog/Haze'
    return '☀️ Clear'
  }

  return (
    <div className="flex h-screen flex-col bg-asphalt-900 text-smoke-100">
      <StatusBar />
      <header className="sticky top-8 z-50 border-b border-smoke-500/20 bg-asphalt-700 px-gutter py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="-ml-2 flex h-touch w-touch items-center justify-center rounded-full"><ArrowLeft /></button>
          <h1 className="text-display-md">Trip Risk</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-gutter py-5 pb-32">
        <div className="space-y-4 slide-up">
          {/* Input form */}
          <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
            <div className="text-label text-warning mb-3">Route Details</div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-smoke-400">Origin</label>
                <div className="flex items-center gap-2 rounded-sharp border border-smoke-500/20 bg-asphalt-900 px-3">
                  <MapPin size={14} className="text-safe" />
                  <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Delhi"
                    className="min-h-touch flex-1 bg-transparent text-body" />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-smoke-400">Destination</label>
                <div className="flex items-center gap-2 rounded-sharp border border-smoke-500/20 bg-asphalt-900 px-3">
                  <Navigation size={14} className="text-emergency" />
                  <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Agra"
                    className="min-h-touch flex-1 bg-transparent text-body" />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-smoke-400">Departure Time</label>
                <input type="datetime-local" value={departureTime} onChange={e => setDepartureTime(e.target.value)}
                  className="w-full min-h-touch rounded-sharp border border-smoke-500/20 bg-asphalt-900 px-3 text-body text-smoke-100" />
              </div>
              <div>
                <label className="text-[11px] text-smoke-400">Primary Route Type</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {ROUTE_TYPES.map(rt => (
                    <button key={rt.id} onClick={() => setRouteType(rt.id)}
                      className={`rounded-pill px-3 py-1.5 text-[11px] font-medium ${routeType === rt.id ? 'bg-emergency text-white' : 'bg-asphalt-400 text-smoke-300'}`}>
                      {rt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={analyze} className="btn-primary mt-4 w-full gap-2"><Shield size={16} />Analyze Risk</button>
          </section>

          {/* Results */}
          {result && (
            <>
              {/* Score Card */}
              <section className="rounded-card border p-card-pad text-center" style={{ borderColor: getScoreColor(result.score) + '50', background: getScoreColor(result.score) + '10' }}>
                <div className="text-[11px] font-medium uppercase tracking-wider text-smoke-300">Trip Risk Score</div>
                <div className="mt-2 text-6xl font-bold font-display" style={{ color: getScoreColor(result.score) }}>
                  {result.score}<span className="text-2xl text-smoke-400">/10</span>
                </div>
                <p className="mt-2 text-body text-smoke-200">
                  {origin || 'Origin'} → {destination || 'Destination'}
                </p>
                <p className="text-caption mt-1">
                  {result.score <= 3 ? 'Low risk — safe to travel' : result.score <= 5 ? 'Moderate risk — drive carefully' : result.score <= 7 ? 'Elevated risk — extra caution needed' : 'High risk — consider postponing'}
                </p>
              </section>

              {/* Hazards */}
              {result.hazards.length > 0 && (
                <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                  <div className="text-label text-emergency mb-3">⚠️ Route Hazards</div>
                  <div className="space-y-2">
                    {result.hazards.map((h, i) => (
                      <div key={i} className={`flex items-start gap-2 rounded-sharp p-2.5 border ${h.severity === 'critical' ? 'border-emergency/30 bg-emergency/10' : h.severity === 'high' ? 'border-warning/30 bg-warning/10' : 'border-smoke-500/15 bg-asphalt-500'}`}>
                        <AlertTriangle size={14} className={h.severity === 'critical' ? 'text-emergency' : 'text-warning'} />
                        <span className="text-[12px] text-smoke-200">{h.desc}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Weather + AQI + Flood */}
              <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                <div className="text-label text-smoke-300 mb-3">Conditions</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-sharp bg-asphalt-500 p-3 text-center">
                    <Cloud size={18} className="mx-auto text-blue-400 mb-1" />
                    <div className="text-[11px] text-smoke-400">Weather</div>
                    <div className="text-[12px] font-medium">{weatherLabel(result.weatherCode)}</div>
                  </div>
                  <div className="rounded-sharp bg-asphalt-500 p-3 text-center">
                    <Eye size={18} className="mx-auto mb-1" style={{ color: result.aqiAlert.color }} />
                    <div className="text-[11px] text-smoke-400">AQI</div>
                    <div className="text-[12px] font-medium" style={{ color: result.aqiAlert.color }}>{result.aqi}</div>
                  </div>
                  <div className="rounded-sharp bg-asphalt-500 p-3 text-center">
                    <Gauge size={18} className="mx-auto mb-1" style={{ color: result.flood.color }} />
                    <div className="text-[11px] text-smoke-400">Flood</div>
                    <div className="text-[12px] font-medium capitalize" style={{ color: result.flood.color }}>{result.flood.level}</div>
                  </div>
                </div>
              </section>

              {/* AQI Alert */}
              {result.aqi > 100 && (
                <section className="rounded-card border border-warning/25 bg-warning-muted p-card-pad">
                  <div className="text-[12px] font-medium text-warning">{result.aqiAlert.msg}</div>
                  {result.aqiAlert.breakInterval && (
                    <div className="mt-1 flex items-center gap-1 text-caption">
                      <Clock size={12} />Break every {result.aqiAlert.breakInterval} min recommended
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
