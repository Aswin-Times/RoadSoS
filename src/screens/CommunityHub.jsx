import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Plus, ShieldCheck, Star, AlertTriangle, Eye, TrendingUp, Users, Award, Flag, Droplets } from 'lucide-react'
import StatusBar from '../components/shared/StatusBar'
import { useAppStore } from '../store/useAppStore'
import { activeHazards, reportHazard } from '../utils/communityNetwork'

const hazardTypes = ['OilSlick', 'Pothole', 'Debris', 'Flood', 'FogPatch', 'AccidentScene']

const mockBlackSpots = [
  { id: 'bs1', location: 'NH-19 Mathura Bypass', incidents: 12, severity: 'critical', trend: 'rising' },
  { id: 'bs2', location: 'Ring Road Sector 14', incidents: 7, severity: 'confirmed', trend: 'stable' },
  { id: 'bs3', location: 'Old Delhi Station Crossing', incidents: 4, severity: 'emerging', trend: 'rising' },
]

const mockLeaderboard = [
  { rank: 1, name: 'Anonymous Helper', responses: 28, badge: '🏆', training: 'CPR Certified' },
  { rank: 2, name: 'Road Guardian', responses: 21, badge: '⭐', training: 'First Responder' },
  { rank: 3, name: 'Safe Driver', responses: 15, badge: '🛡️', training: 'Basic Trained' },
  { rank: 4, name: 'Night Watch', responses: 12, badge: '🩸', training: 'Blood Donor' },
  { rank: 5, name: 'Community Hero', responses: 9, badge: '❤️', training: 'None' },
]

const mockPotholes = [
  { id: 'p1', severity: 'high', location: 'MG Road near Metro', reports: 8, lastReported: '2h ago' },
  { id: 'p2', severity: 'medium', location: 'Ring Road Flyover Exit', reports: 4, lastReported: '5h ago' },
  { id: 'p3', severity: 'low', location: 'Sector 22 Market Road', reports: 2, lastReported: '1d ago' },
]

export default function CommunityHub() {
  const navigate = useNavigate()
  const { location } = useAppStore()
  const [hazards, setHazards] = useState([])
  const [selectedType, setSelectedType] = useState('Pothole')
  const [activeTab, setActiveTab] = useState('hazards')
  const [now] = useState(Date.now)

  const refresh = () => activeHazards().then(setHazards)
  useEffect(() => { refresh() }, [])

  const addHazard = async () => {
    await reportHazard({ type: selectedType, location })
    refresh()
  }

  const severityColor = { critical: 'text-emergency', confirmed: 'text-warning', emerging: 'text-blue-400' }
  const severityBg = { critical: 'bg-emergency/15 border-emergency/30', confirmed: 'bg-warning/15 border-warning/30', emerging: 'bg-blue-400/15 border-blue-400/30' }
  const potholeSeverity = { high: 'text-emergency', medium: 'text-warning', low: 'text-safe' }

  const tabs = [
    { id: 'hazards', label: 'Hazards', icon: <AlertTriangle size={14} /> },
    { id: 'blackspots', label: 'Black Spots', icon: <Eye size={14} /> },
    { id: 'potholes', label: 'Potholes', icon: <Flag size={14} /> },
    { id: 'leaderboard', label: 'Leaders', icon: <Award size={14} /> },
  ]

  return (
    <div className="flex h-screen flex-col bg-asphalt-900 text-smoke-100">
      <StatusBar />
      <header className="sticky top-8 z-50 border-b border-smoke-500/20 bg-asphalt-700 px-gutter py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="-ml-2 flex h-touch w-touch items-center justify-center rounded-full"><ArrowLeft /></button>
          <h1 className="text-display-md">Community</h1>
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1 whitespace-nowrap rounded-pill px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-all ${activeTab === t.id ? 'bg-emergency text-white' : 'bg-asphalt-500 text-smoke-300'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-gutter py-5 pb-32">
        {activeTab === 'hazards' && (
          <div className="space-y-4 slide-up">
            <section className="rounded-card border border-emergency/25 bg-emergency-muted p-card-pad">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-label text-emergency">Live Hazard Mesh</div>
                  <p className="text-body text-smoke-200">{hazards.length} active hazard reports nearby.</p>
                </div>
                <MapPin className="text-emergency" />
              </div>
            </section>

            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <label className="text-label text-smoke-300">Report a hazard</label>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {hazardTypes.map((type) => (
                  <button key={type} onClick={() => setSelectedType(type)}
                    className={`min-h-touch rounded-card border px-2 text-[11px] ${selectedType === type ? 'border-emergency bg-emergency text-smoke-100' : 'border-smoke-500/20 bg-asphalt-500 text-smoke-300'}`}>
                    {type}
                  </button>
                ))}
              </div>
              <button onClick={addHazard} className="btn-primary mt-3 w-full gap-2"><Plus size={16} />Drop Pin</button>
            </section>

            <section className="space-y-2">
              {hazards.map((hazard) => (
                <article key={hazard.id} className="service-card p-card-pad">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-heading">{hazard.type}</h2>
                      <p className="text-caption">Expires in {Math.max(1, Math.round((hazard.expiresAt - now) / 60000))} min</p>
                    </div>
                    {hazard.verified ? <ShieldCheck className="text-safe" /> : <span className="rounded-pill bg-asphalt-500 px-2 py-0.5 text-[11px] text-smoke-300">1 report</span>}
                  </div>
                </article>
              ))}
            </section>

            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <div className="mb-2 flex items-center gap-2 text-label text-warning"><Star size={14} />Hospital Ratings</div>
              <p className="text-caption">Community ratings appear after hospital check-ins. Anonymous by design.</p>
            </section>
          </div>
        )}

        {activeTab === 'blackspots' && (
          <div className="space-y-4 slide-up">
            <section className="rounded-card border border-emergency/25 bg-emergency-muted p-card-pad">
              <div className="text-label text-emergency">Accident Black Spots</div>
              <p className="mt-1 text-caption">Areas with 3+ incidents in 90 days within 50m radius.</p>
            </section>
            {mockBlackSpots.map(spot => (
              <article key={spot.id} className={`rounded-card border p-card-pad ${severityBg[spot.severity]}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-[14px] font-medium ${severityColor[spot.severity]}`}>{spot.location}</h3>
                    <p className="text-caption mt-0.5">{spot.incidents} incidents • {spot.severity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={12} className={spot.trend === 'rising' ? 'text-emergency' : 'text-smoke-400'} />
                    <span className="text-[10px] text-smoke-400">{spot.trend}</span>
                  </div>
                </div>
              </article>
            ))}
            <button className="btn-ghost w-full gap-2 text-[12px]">📊 Download Monthly Report</button>
          </div>
        )}

        {activeTab === 'potholes' && (
          <div className="space-y-4 slide-up">
            <section className="rounded-card border border-warning/25 bg-warning-muted p-card-pad">
              <div className="text-label text-warning">Crowdsourced Pothole Map</div>
              <p className="mt-1 text-caption">Passively detected via accelerometer + user reports.</p>
            </section>
            {mockPotholes.map(p => (
              <article key={p.id} className="service-card p-card-pad">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-medium">{p.location}</h3>
                    <p className="text-caption">{p.reports} reports • {p.lastReported}</p>
                  </div>
                  <span className={`rounded-pill px-2 py-0.5 text-[10px] font-bold uppercase ${potholeSeverity[p.severity]} bg-asphalt-400`}>{p.severity}</span>
                </div>
              </article>
            ))}
            <button className="btn-primary w-full gap-2"><Flag size={14} />Report Pothole Here</button>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4 slide-up">
            <section className="rounded-card border border-safe/25 bg-safe-muted p-card-pad">
              <div className="text-label text-safe">Responder Leaderboard</div>
              <p className="mt-1 text-caption">Anonymous heroes in your city. Badges verify their training level.</p>
            </section>
            {mockLeaderboard.map(user => (
              <article key={user.rank} className="service-card p-card-pad">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-lg ${user.rank <= 3 ? 'bg-warning/20 text-warning' : 'bg-asphalt-400 text-smoke-300'}`}>
                    {user.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-medium">{user.name}</span>
                      <span>{user.badge}</span>
                    </div>
                    <div className="flex items-center gap-2 text-caption">
                      <span>{user.responses} responses</span>
                      <span className="rounded-pill bg-asphalt-400 px-1.5 py-0.5 text-[9px]">{user.training}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
