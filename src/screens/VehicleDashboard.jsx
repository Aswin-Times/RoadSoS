import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bluetooth, Gauge, Thermometer, Fuel, AlertTriangle, Timer, RotateCw, Download, Car, Shield, Bell } from 'lucide-react'
import StatusBar from '../components/shared/StatusBar'
import { useAppStore } from '../store/useAppStore'
import { OBD_PIDS, ALERT_THRESHOLDS, VehicleBlackbox, FatigueMonitor, RECALL_EXAMPLES } from '../utils/vehicleIntel'

export default function VehicleDashboard() {
  const navigate = useNavigate()
  const { vehicleInfo } = useAppStore()
  const [activeTab, setActiveTab] = useState('live')
  const [connected, setConnected] = useState(false)
  const [obdData, setObdData] = useState({ speed: 0, rpm: 0, coolant: 85, fuel: 62 })
  const [fatigueMinutes, setFatigueMinutes] = useState(0)
  const [blackboxEntries, setBlackboxEntries] = useState(0)
  const simulateRef = useRef(null)

  // Simulate OBD data for demo
  const startSimulation = () => {
    setConnected(true)
    simulateRef.current = setInterval(() => {
      setObdData(prev => ({
        speed: Math.min(120, Math.max(0, prev.speed + (Math.random() - 0.45) * 10)),
        rpm: Math.min(6500, Math.max(800, prev.rpm + (Math.random() - 0.45) * 400)),
        coolant: Math.min(110, Math.max(70, prev.coolant + (Math.random() - 0.48) * 2)),
        fuel: Math.max(0, prev.fuel - Math.random() * 0.05),
      }))
      setBlackboxEntries(p => p + 1)
      setFatigueMinutes(p => p + 0.5)
    }, 500)
  }

  useEffect(() => () => clearInterval(simulateRef.current), [])

  const stopSimulation = () => { clearInterval(simulateRef.current); setConnected(false) }

  const fatigueLevel = fatigueMinutes >= 180 ? 'critical' : fatigueMinutes >= 120 ? 'warning' : fatigueMinutes >= 90 ? 'info' : 'ok'
  const fatigueColor = { critical: '#E8361A', warning: '#F59E0B', info: '#3B82F6', ok: '#22C55E' }

  const tabs = [
    { id: 'live', label: 'Live', icon: <Gauge size={14} /> },
    { id: 'blackbox', label: 'Blackbox', icon: <RotateCw size={14} /> },
    { id: 'recalls', label: 'Recalls', icon: <Bell size={14} /> },
  ]

  return (
    <div className="flex h-screen flex-col bg-asphalt-900 text-smoke-100">
      <StatusBar />
      <header className="sticky top-8 z-50 border-b border-smoke-500/20 bg-asphalt-700 px-gutter py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="-ml-2 flex h-touch w-touch items-center justify-center rounded-full"><ArrowLeft /></button>
          <h1 className="text-display-md">Vehicle</h1>
          <div className={`ml-auto flex items-center gap-1 rounded-pill px-2 py-0.5 text-[10px] ${connected ? 'bg-safe/20 text-safe' : 'bg-smoke-500/20 text-smoke-400'}`}>
            <Bluetooth size={10} />{connected ? 'OBD Connected' : 'Disconnected'}
          </div>
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
        {activeTab === 'live' && (
          <div className="space-y-4 slide-up">
            {!connected ? (
              <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad text-center">
                <Car size={48} className="mx-auto mb-3 text-smoke-400" />
                <div className="text-heading mb-1">Connect OBD-II</div>
                <p className="text-caption mb-4">Pair with your ELM327 adapter via Bluetooth to see live vehicle data.</p>
                <button onClick={startSimulation} className="btn-primary w-full gap-2"><Bluetooth size={16} />Connect (Demo Mode)</button>
              </section>
            ) : (
              <>
                {/* Instrument Cluster */}
                <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Speed */}
                    <div className="rounded-card border border-smoke-500/15 bg-asphalt-600 p-4 text-center">
                      <Gauge size={20} className="mx-auto mb-1 text-blue-400" />
                      <div className={`text-4xl font-mono font-bold ${obdData.speed > ALERT_THRESHOLDS.speedWarning ? 'text-emergency animate-sos-pulse' : 'text-smoke-100'}`}>
                        {Math.round(obdData.speed)}
                      </div>
                      <div className="text-[10px] text-smoke-400 uppercase">km/h</div>
                    </div>
                    {/* RPM */}
                    <div className="rounded-card border border-smoke-500/15 bg-asphalt-600 p-4 text-center">
                      <RotateCw size={20} className="mx-auto mb-1 text-warning" />
                      <div className={`text-4xl font-mono font-bold ${obdData.rpm > ALERT_THRESHOLDS.rpmHigh ? 'text-emergency' : 'text-smoke-100'}`}>
                        {Math.round(obdData.rpm)}
                      </div>
                      <div className="text-[10px] text-smoke-400 uppercase">RPM</div>
                    </div>
                    {/* Coolant */}
                    <div className="rounded-card border border-smoke-500/15 bg-asphalt-600 p-4 text-center">
                      <Thermometer size={20} className={`mx-auto mb-1 ${obdData.coolant > ALERT_THRESHOLDS.coolantHigh ? 'text-emergency' : 'text-blue-400'}`} />
                      <div className={`text-3xl font-mono font-bold ${obdData.coolant > ALERT_THRESHOLDS.coolantHigh ? 'text-emergency animate-sos-pulse' : 'text-smoke-100'}`}>
                        {Math.round(obdData.coolant)}°
                      </div>
                      <div className="text-[10px] text-smoke-400 uppercase">Coolant</div>
                    </div>
                    {/* Fuel */}
                    <div className="rounded-card border border-smoke-500/15 bg-asphalt-600 p-4 text-center">
                      <Fuel size={20} className={`mx-auto mb-1 ${obdData.fuel < ALERT_THRESHOLDS.fuelLow ? 'text-emergency' : 'text-safe'}`} />
                      <div className={`text-3xl font-mono font-bold ${obdData.fuel < ALERT_THRESHOLDS.fuelLow ? 'text-emergency' : 'text-smoke-100'}`}>
                        {Math.round(obdData.fuel)}%
                      </div>
                      <div className="text-[10px] text-smoke-400 uppercase">Fuel</div>
                    </div>
                  </div>
                </section>

                {/* Alerts */}
                {(obdData.coolant > ALERT_THRESHOLDS.coolantHigh || obdData.fuel < ALERT_THRESHOLDS.fuelLow) && (
                  <section className="rounded-card border border-emergency/30 bg-emergency-muted p-card-pad">
                    <div className="flex items-center gap-2 text-emergency"><AlertTriangle size={16} />Vehicle Alert</div>
                    {obdData.coolant > ALERT_THRESHOLDS.coolantHigh && <p className="mt-1 text-[12px] text-smoke-200">⚠️ Coolant temperature HIGH — pull over safely</p>}
                    {obdData.fuel < ALERT_THRESHOLDS.fuelLow && <p className="mt-1 text-[12px] text-smoke-200">⛽ Fuel critically low — find nearest station</p>}
                  </section>
                )}

                {/* Fatigue Monitor */}
                <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-label" style={{ color: fatigueColor[fatigueLevel] }}>
                        <Timer size={14} />Driving Time
                      </div>
                      <div className="mt-1 font-mono text-2xl font-bold text-smoke-100">{Math.floor(fatigueMinutes)}m</div>
                    </div>
                    <div className="text-right">
                      {fatigueMinutes >= 120 && <p className="text-[11px] text-warning">Take a break soon</p>}
                      {fatigueMinutes >= 180 && <p className="text-[11px] text-emergency font-medium">Pull over NOW</p>}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-2 rounded-full bg-asphalt-500 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (fatigueMinutes / 180) * 100)}%`, background: fatigueColor[fatigueLevel] }} />
                  </div>
                </section>

                <button onClick={stopSimulation} className="btn-ghost w-full gap-2"><Bluetooth size={14} />Disconnect</button>
              </>
            )}
          </div>
        )}

        {activeTab === 'blackbox' && (
          <div className="space-y-4 slide-up">
            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <div className="text-label text-warning mb-2">Vehicle Blackbox</div>
              <p className="text-caption">2-minute rolling buffer recording vehicle data at 500ms intervals.</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-sharp bg-asphalt-500 p-3 text-center">
                  <div className="text-2xl font-mono font-bold text-safe">{blackboxEntries}</div>
                  <div className="text-[10px] text-smoke-400">Entries</div>
                </div>
                <div className="rounded-sharp bg-asphalt-500 p-3 text-center">
                  <div className="text-2xl font-mono font-bold text-blue-400">{Math.min(120, Math.round(blackboxEntries * 0.5))}s</div>
                  <div className="text-[10px] text-smoke-400">Buffer</div>
                </div>
              </div>
            </section>
            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <div className="text-label text-smoke-300 mb-2">Export Options</div>
              <div className="space-y-2">
                <button className="btn-ghost w-full gap-2 text-[12px]"><Download size={14} />Export as CSV</button>
                <button className="btn-ghost w-full gap-2 text-[12px]"><Download size={14} />Export as GPX Track</button>
              </div>
            </section>
            <section className="rounded-card border border-emergency/20 bg-emergency-muted p-card-pad">
              <div className="text-[12px] text-smoke-200">On crash detection, the blackbox buffer is automatically frozen, hashed for integrity, and stored as evidence.</div>
            </section>
          </div>
        )}

        {activeTab === 'recalls' && (
          <div className="space-y-4 slide-up">
            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <div className="text-label text-warning mb-1">Vehicle Safety Recalls</div>
              <p className="text-caption">Registered: {vehicleInfo?.regNumber || 'No vehicle registered'}</p>
            </section>
            {RECALL_EXAMPLES.map((recall, i) => (
              <article key={i} className={`service-card p-card-pad border-l-4 ${recall.severity === 'critical' ? 'border-l-emergency' : recall.severity === 'high' ? 'border-l-warning' : 'border-l-blue-400'}`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className={recall.severity === 'critical' ? 'text-emergency' : 'text-warning'} />
                  <div className="flex-1">
                    <div className="text-[14px] font-medium">{recall.make} {recall.model} ({recall.year})</div>
                    <p className="text-[12px] text-smoke-300 mt-0.5">{recall.issue}</p>
                    <div className="mt-2 flex gap-2">
                      <button className="rounded-sharp bg-emergency/15 px-2 py-1 text-[10px] font-medium text-emergency">Find Dealer</button>
                      <button className="rounded-sharp bg-asphalt-400 px-2 py-1 text-[10px] text-smoke-300">Schedule Repair</button>
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
