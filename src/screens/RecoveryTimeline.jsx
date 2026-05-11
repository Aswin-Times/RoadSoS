import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Heart, Brain, FileText, Shield, Phone, Activity, ChevronRight, Check, X } from 'lucide-react'
import StatusBar from '../components/shared/StatusBar'
import { useAppStore } from '../store/useAppStore'
import { getCheckInSchedule, PCL5_QUESTIONS, interpretPCL5, CRISIS_HELPLINES, BREATHING_CONFIG } from '../utils/mentalHealth'

export default function RecoveryTimeline() {
  const navigate = useNavigate()
  const { countryCode, sosStartTime } = useAppStore()
  const [activeTab, setActiveTab] = useState('timeline')
  const [pcl5Answers, setPcl5Answers] = useState({})
  const [pcl5Result, setPcl5Result] = useState(null)
  const [breathePhase, setBreathePhase] = useState(0)
  const [breatheActive, setBreatheActive] = useState(false)
  const [breatheProgress, setBreatheProgress] = useState(0)
  const breatheRef = useRef(null)

  const incidentTime = sosStartTime || Date.now() - 86400000
  const schedule = getCheckInSchedule(incidentTime)
  const helplines = CRISIS_HELPLINES[countryCode] || CRISIS_HELPLINES.IN

  // Golden hour timer
  const [goldenMinutes, setGoldenMinutes] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => {
      setGoldenMinutes(Math.floor((Date.now() - incidentTime) / 60000))
    }, 1000)
    return () => clearInterval(iv)
  }, [incidentTime])

  // Breathing pacer
  useEffect(() => {
    if (!breatheActive) return
    const phases = BREATHING_CONFIG.phases
    let elapsed = 0
    const totalCycle = phases.reduce((s, p) => s + p.duration, 0)

    breatheRef.current = setInterval(() => {
      elapsed += 0.05
      const cyclePos = elapsed % totalCycle
      let cumulative = 0
      for (let i = 0; i < phases.length; i++) {
        cumulative += phases[i].duration
        if (cyclePos < cumulative) {
          setBreathePhase(i)
          const phaseElapsed = cyclePos - (cumulative - phases[i].duration)
          setBreatheProgress(phaseElapsed / phases[i].duration)
          break
        }
      }
    }, 50)
    return () => clearInterval(breatheRef.current)
  }, [breatheActive])

  const submitPCL5 = () => {
    const total = Object.values(pcl5Answers).reduce((s, v) => s + v, 0)
    setPcl5Result(interpretPCL5(total))
  }

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: <Clock size={16} /> },
    { id: 'mental', label: 'Mental Health', icon: <Brain size={16} /> },
    { id: 'breathe', label: 'Breathe', icon: <Heart size={16} /> },
  ]

  const goldenColor = goldenMinutes < 60 ? 'text-emergency' : 'text-smoke-300'

  return (
    <div className="flex h-screen flex-col bg-asphalt-900 text-smoke-100">
      <StatusBar />
      <header className="sticky top-8 z-50 border-b border-smoke-500/20 bg-asphalt-700 px-gutter py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="-ml-2 flex h-touch w-touch items-center justify-center rounded-full"><ArrowLeft /></button>
          <h1 className="text-display-md">Recovery</h1>
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
        {activeTab === 'timeline' && (
          <div className="space-y-4 slide-up">
            {/* Golden Hour */}
            <section className="rounded-card border border-emergency/30 bg-emergency-muted p-card-pad">
              <div className="flex items-center gap-2 text-label text-emergency"><Clock size={16} />Golden Hour Timer</div>
              <div className={`mt-2 font-mono text-3xl font-bold ${goldenColor}`}>
                {Math.floor(goldenMinutes / 60)}h {goldenMinutes % 60}m
              </div>
              <p className="mt-1 text-caption">{goldenMinutes < 60 ? 'Critical window active — rapid treatment improves outcomes' : 'Golden hour has passed'}</p>
            </section>

            {/* Telehealth Schedule */}
            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <div className="mb-3 text-label text-safe">Telehealth Appointments</div>
              <div className="space-y-3">
                {[
                  { day: 'Day 0', type: 'Emergency consultation', status: 'completed', icon: <Activity size={16} /> },
                  { day: 'Day 1', type: 'Nurse follow-up call', status: 'upcoming', icon: <Phone size={16} /> },
                  { day: 'Day 3', type: 'GP consultation', status: 'scheduled', icon: <Heart size={16} /> },
                  { day: 'Day 7', type: 'Physiotherapy assessment', status: 'scheduled', icon: <Activity size={16} /> },
                  { day: 'Day 30', type: 'Mental health check-in', status: 'scheduled', icon: <Brain size={16} /> },
                ].map((appt, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-sharp border border-smoke-500/15 bg-asphalt-600 p-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${appt.status === 'completed' ? 'bg-safe/20 text-safe' : 'bg-asphalt-400 text-smoke-300'}`}>
                      {appt.status === 'completed' ? <Check size={14} /> : appt.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium">{appt.type}</div>
                      <div className="text-[11px] text-smoke-400">{appt.day}</div>
                    </div>
                    {appt.status !== 'completed' && (
                      <button className="rounded-sharp bg-asphalt-400 px-2 py-1 text-[11px] text-smoke-200">Reschedule</button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
              <div className="mb-3 text-label text-warning">Recovery Actions</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Insurance Claim', icon: <Shield size={18} />, path: '/incident-vault' },
                  { label: 'Evidence Pack', icon: <FileText size={18} />, path: '/incident-vault' },
                  { label: 'FIR Status', icon: <FileText size={18} />, path: '/incident-vault' },
                  { label: 'Mental Check-in', icon: <Brain size={18} />, action: () => setActiveTab('mental') },
                ].map((item, i) => (
                  <button key={i} onClick={item.action || (() => navigate(item.path))}
                    className="flex items-center gap-2 rounded-card border border-smoke-500/15 bg-asphalt-500 p-3 text-left text-[13px] transition-all hover:-translate-y-0.5 active:scale-95">
                    <span className="text-smoke-300">{item.icon}</span>{item.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'mental' && (
          <div className="space-y-4 slide-up">
            {!pcl5Result ? (
              <>
                <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                  <div className="text-label text-warning">PTSD Screening (PCL-5)</div>
                  <p className="mt-1 text-caption">In the past week, how much have you been bothered by:</p>
                </section>
                {PCL5_QUESTIONS.map((q, qi) => (
                  <section key={q.id} className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                    <div className="mb-2 text-[13px] font-medium">{qi + 1}. {q.text}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {q.scale.map((s, si) => (
                        <button key={si} onClick={() => setPcl5Answers(prev => ({ ...prev, [q.id]: si }))}
                          className={`rounded-pill px-2.5 py-1 text-[11px] transition-all ${pcl5Answers[q.id] === si ? 'bg-emergency text-white' : 'bg-asphalt-400 text-smoke-300 hover:bg-asphalt-300'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
                <button onClick={submitPCL5} disabled={Object.keys(pcl5Answers).length < 5}
                  className="btn-primary w-full disabled:opacity-40">Submit Assessment</button>
              </>
            ) : (
              <div className="space-y-4">
                <section className="rounded-card border p-card-pad" style={{ borderColor: pcl5Result.color + '40', background: pcl5Result.color + '15' }}>
                  <div className="text-label" style={{ color: pcl5Result.color }}>{pcl5Result.title}</div>
                  <p className="mt-2 text-body text-smoke-200">{pcl5Result.message}</p>
                </section>
                <section className="rounded-card border border-smoke-500/20 bg-asphalt-700 p-card-pad">
                  <div className="mb-2 text-label text-smoke-300">Crisis Helplines</div>
                  {helplines.map((h, i) => (
                    <a key={i} href={`tel:${h.phone}`} className="mt-2 flex items-center justify-between rounded-sharp border border-smoke-500/15 bg-asphalt-500 p-3">
                      <div>
                        <div className="text-[13px] font-medium">{h.name}</div>
                        <div className="text-[11px] text-smoke-400">{h.desc}</div>
                      </div>
                      <div className="font-mono text-[14px] text-emergency">{h.phone}</div>
                    </a>
                  ))}
                </section>
                <button onClick={() => { setPcl5Result(null); setPcl5Answers({}) }} className="btn-ghost w-full">Retake Assessment</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'breathe' && (
          <div className="flex flex-col items-center justify-center pt-10 slide-up">
            <p className="mb-8 text-label text-smoke-300">4-7-8 Breathing Technique</p>
            <div className="relative flex h-56 w-56 items-center justify-center">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-smoke-500/20" />
              {/* Animated circle */}
              <div className="flex items-center justify-center rounded-full transition-all duration-500"
                style={{
                  width: `${breatheActive ? 80 + breatheProgress * 120 : 120}px`,
                  height: `${breatheActive ? 80 + breatheProgress * 120 : 120}px`,
                  background: breatheActive ? BREATHING_CONFIG.phases[breathePhase]?.color + '30' : '#3B82F620',
                  border: `3px solid ${breatheActive ? BREATHING_CONFIG.phases[breathePhase]?.color : '#3B82F6'}`,
                  transform: breatheActive && breathePhase === 2 ? `scale(${1 - breatheProgress * 0.4})` : breatheActive && breathePhase === 0 ? `scale(${0.6 + breatheProgress * 0.4})` : 'scale(0.8)'
                }}>
                <span className="text-[16px] font-medium" style={{ color: breatheActive ? BREATHING_CONFIG.phases[breathePhase]?.color : '#3B82F6' }}>
                  {breatheActive ? BREATHING_CONFIG.phases[breathePhase]?.name : 'Start'}
                </span>
              </div>
            </div>
            <button onClick={() => setBreatheActive(!breatheActive)}
              className={`mt-10 rounded-pill px-8 py-3 text-label transition-all ${breatheActive ? 'bg-smoke-500/20 text-smoke-300' : 'bg-emergency text-white'}`}>
              {breatheActive ? 'Stop' : 'Begin Breathing'}
            </button>
            <p className="mt-4 text-center text-caption">Inhale 4s → Hold 7s → Exhale 8s<br/>Close your eyes — haptic mode works too.</p>
          </div>
        )}
      </main>
    </div>
  )
}
