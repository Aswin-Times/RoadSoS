import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Droplets, MapPin, Phone, Heart, Star, Navigation, Check, AlertTriangle } from 'lucide-react'
import StatusBar from '../components/shared/StatusBar'
import { useAppStore } from '../store/useAppStore'
import { getNearbyBloodBanks, getInventoryColor, getDonorBadges, isDonorEligible, getDonorTransportLink } from '../utils/bloodBank'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export default function BloodBank() {
  const navigate = useNavigate()
  const { location, bloodGroup } = useAppStore()
  const [activeTab, setActiveTab] = useState('find')
  const [selectedType, setSelectedType] = useState(bloodGroup || 'O+')
  const [banks, setBanks] = useState([])
  const [donorProfile, setDonorProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('roadsos-donor')) } catch { return null }
  })
  const [requestActive, setRequestActive] = useState(false)
  const [donorCount, setDonorCount] = useState(0)

  useEffect(() => {
    const lat = location?.lat || 28.6139
    const lng = location?.lng || 77.209
    setBanks(getNearbyBloodBanks(lat, lng))
  }, [location])

  const registerDonor = () => {
    const profile = { bloodType: selectedType, lastDonationDate: null, donations: 0, eligible: true, registeredAt: new Date().toISOString() }
    localStorage.setItem('roadsos-donor', JSON.stringify(profile))
    setDonorProfile(profile)
  }

  const recordDonation = () => {
    if (!donorProfile) return
    const updated = { ...donorProfile, donations: donorProfile.donations + 1, lastDonationDate: new Date().toISOString(), eligible: false }
    localStorage.setItem('roadsos-donor', JSON.stringify(updated))
    setDonorProfile(updated)
  }

  const simulateRequest = () => {
    setRequestActive(true)
    setDonorCount(0)
    const iv = setInterval(() => setDonorCount(p => { if (p >= 3) { clearInterval(iv); return 3 } return p + 1 }), 3000)
  }

  const colorMap = { green: 'bg-safe', amber: 'bg-warning', red: 'bg-emergency', gray: 'bg-smoke-400' }
  const colorTextMap = { green: 'text-safe', amber: 'text-warning', red: 'text-emergency', gray: 'text-smoke-400' }

  const tabs = [
    { id: 'find', label: 'Find Blood', icon: <Droplets size={14} /> },
    { id: 'donor', label: 'Donor', icon: <Heart size={14} /> },
    { id: 'request', label: 'Request', icon: <AlertTriangle size={14} /> },
  ]

  return (
    <div className="flex h-screen flex-col bg-asphalt-900 text-smoke-100">
      <StatusBar />
      <header className="sticky top-8 z-50 border-b border-smoke-500/20 bg-asphalt-700 px-gutter py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="-ml-2 flex h-touch w-touch items-center justify-center rounded-full"><ArrowLeft /></button>
          <h1 className="text-display-md">Blood Bank</h1>
        </div>
        <div className="mt-3 flex gap-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12px] font-medium uppercase tracking-wider transition-all ${activeTab === t.id ? 'bg-emergency text-white' : 'bg-asphalt-500 text-smoke-300'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-gutter py-5 pb-32">
        {activeTab === 'find' && (
          <div className="space-y-4 slide-up">
            {/* Blood type filter */}
            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <div className="text-label text-emergency mb-2">Select Blood Type</div>
              <div className="flex flex-wrap gap-1.5">
                {BLOOD_TYPES.map(bt => (
                  <button key={bt} onClick={() => setSelectedType(bt)}
                    className={`rounded-pill px-3 py-1.5 text-[13px] font-bold transition-all ${selectedType === bt ? 'bg-emergency text-white shadow-glow-red' : 'bg-asphalt-400 text-smoke-300'}`}>
                    {bt}
                  </button>
                ))}
              </div>
            </section>

            {/* Blood bank list */}
            {banks.map(bank => {
              const units = bank.inventory[selectedType]
              const color = getInventoryColor(units)
              return (
                <article key={bank.id} className="service-card p-card-pad">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-heading">{bank.name}</h3>
                      <p className="text-caption">{bank.city} • {bank.distance?.toFixed(1)} km</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorMap[color]}/20`}>
                      <span className={`text-[16px] font-bold ${colorTextMap[color]}`}>{units ?? '?'}</span>
                    </div>
                  </div>
                  {/* Mini inventory bar */}
                  <div className="mt-3 grid grid-cols-4 gap-1">
                    {Object.entries(bank.inventory).filter(([k]) => k !== 'platelets').map(([type, count]) => {
                      const c = getInventoryColor(count)
                      return (
                        <div key={type} className="flex flex-col items-center rounded-sharp bg-asphalt-500 px-1 py-1">
                          <span className="text-[10px] text-smoke-400">{type}</span>
                          <span className={`text-[12px] font-bold ${colorTextMap[c]}`}>{count}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a href={`tel:${bank.phone}`} className="btn-ghost flex-1 gap-1 text-[11px]"><Phone size={14} />Call</a>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${bank.lat},${bank.lng}`} target="_blank" rel="noopener"
                      className="btn-primary flex-1 gap-1 text-[11px]"><Navigation size={14} />Navigate</a>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {activeTab === 'donor' && (
          <div className="space-y-4 slide-up">
            {!donorProfile ? (
              <section className="rounded-card border border-emergency/25 bg-emergency-muted p-card-pad">
                <div className="text-label text-emergency mb-2">Register as Donor</div>
                <p className="text-body text-smoke-200 mb-3">Join the blood donor network. You'll be notified when your blood type is urgently needed nearby.</p>
                <div className="text-label text-smoke-300 mb-2">Your Blood Type</div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {BLOOD_TYPES.map(bt => (
                    <button key={bt} onClick={() => setSelectedType(bt)}
                      className={`rounded-pill px-3 py-1.5 text-[13px] font-bold ${selectedType === bt ? 'bg-emergency text-white' : 'bg-asphalt-400 text-smoke-300'}`}>{bt}</button>
                  ))}
                </div>
                <button onClick={registerDonor} className="btn-primary w-full gap-2"><Heart size={16} />Register as {selectedType} Donor</button>
              </section>
            ) : (
              <>
                <section className="rounded-card border border-safe/25 bg-safe-muted p-card-pad">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emergency/20">
                      <span className="text-2xl font-bold text-emergency">{donorProfile.bloodType}</span>
                    </div>
                    <div>
                      <div className="text-heading">Registered Donor</div>
                      <div className="text-caption">
                        {donorProfile.eligible || isDonorEligible(donorProfile.lastDonationDate) ? '✅ Eligible to donate' : '⏳ Cooldown period (56 days)'}
                      </div>
                    </div>
                  </div>
                </section>
                <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                  <div className="text-label text-warning mb-2">Donor Stats</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-sharp bg-asphalt-500 p-3 text-center">
                      <div className="text-2xl font-bold text-emergency">{donorProfile.donations}</div>
                      <div className="text-[11px] text-smoke-400">Donations</div>
                    </div>
                    <div className="rounded-sharp bg-asphalt-500 p-3 text-center">
                      <div className="text-2xl font-bold text-safe">{getDonorBadges(donorProfile.donations).length}</div>
                      <div className="text-[11px] text-smoke-400">Badges</div>
                    </div>
                  </div>
                </section>
                {getDonorBadges(donorProfile.donations).length > 0 && (
                  <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                    <div className="text-label text-safe mb-2">Badges Earned</div>
                    <div className="flex flex-wrap gap-2">
                      {getDonorBadges(donorProfile.donations).map((b, i) => (
                        <div key={i} className="flex items-center gap-1 rounded-pill bg-asphalt-400 px-3 py-1">
                          <span>{b.icon}</span><span className="text-[12px]">{b.name}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                <button onClick={recordDonation} className="btn-primary w-full gap-2" disabled={!isDonorEligible(donorProfile.lastDonationDate)}>
                  <Check size={16} />Record Donation
                </button>
              </>
            )}
          </div>
        )}

        {activeTab === 'request' && (
          <div className="space-y-4 slide-up">
            <section className="rounded-card border border-emergency/30 bg-emergency-muted p-card-pad">
              <div className="text-label text-emergency">Emergency Blood Request</div>
              <p className="mt-1 text-body text-smoke-200">Broadcast a blood request to all matching donors within 15km.</p>
            </section>
            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <div className="text-label text-smoke-300 mb-2">Blood Type Needed</div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {BLOOD_TYPES.map(bt => (
                  <button key={bt} onClick={() => setSelectedType(bt)}
                    className={`rounded-pill px-3 py-1.5 text-[13px] font-bold ${selectedType === bt ? 'bg-emergency text-white' : 'bg-asphalt-400 text-smoke-300'}`}>{bt}</button>
                ))}
              </div>
              {!requestActive ? (
                <button onClick={simulateRequest} className="btn-primary w-full gap-2"><AlertTriangle size={16} />Broadcast {selectedType} Blood Request</button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-card border border-emergency/20 bg-asphalt-500 p-3">
                    <div className="flex items-center gap-2 text-emergency animate-sos-pulse">
                      <Droplets size={16} /><span className="text-[13px] font-medium">Request Active — Broadcasting to nearby donors</span>
                    </div>
                  </div>
                  <div className="rounded-card border border-safe/20 bg-asphalt-500 p-3">
                    <div className="text-safe text-[13px] font-medium">{donorCount} donor{donorCount !== 1 ? 's' : ''} confirmed</div>
                    {donorCount > 0 && <div className="mt-1 text-caption">ETA ~{8 - donorCount * 2} min</div>}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
